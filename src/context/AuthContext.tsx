import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPermissions, UserStatus } from '../types/user';
import { DoxoStorage } from '../lib/storage/db';
import {
  isSupabaseConfigured,
  supabase,
  fetchSupabaseProfile,
  upsertSupabaseProfile,
  DEFAULT_UNVERIFIED_PERMISSIONS,
  DEFAULT_VERIFIED_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from '../lib/supabase';
import { PermissionGateModal } from '../components/common/PermissionGateModal';

export interface AuthCredentials {
  emailOrPhone: string;
  password?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

interface GateModalState {
  isOpen: boolean;
  title: string;
  description: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<boolean>;
  loginAsSuperAdmin: () => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  isSuperAdmin: boolean;
  isVerified: boolean;
  isPendingVerification: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  requirePermission: (permission: keyof UserPermissions, title?: string, description?: string) => boolean;
  verifyUser: (userId: string) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => Promise<void>;
  setUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  triggerPermissionGate: (title?: string, description?: string) => void;
}

const SUPER_ADMIN_EMAIL = 'nukrichachava9@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('doxo_is_authenticated');
    return saved !== null ? saved === 'true' : true;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('doxo_auth_user');
      if (savedUser) return JSON.parse(savedUser);
      return DoxoStorage.getUser();
    } catch {
      return DoxoStorage.getUser();
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [gateState, setGateState] = useState<GateModalState>({
    isOpen: false,
    title: 'ფუნქცია შეზღუდულია',
    description: 'ამ ფუნქციის გამოსაყენებლად საჭიროა ადმინისტრატორის მიერ თქვენი პროფილის ვერიფიკაცია და შესაბამისი უფლების მინიჭება.',
  });

  // Sync session with Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchSupabaseProfile(session.user.id).then(profile => {
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            DoxoStorage.updateUser(profile);
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchSupabaseProfile(session.user.id);
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
          DoxoStorage.updateUser(profile);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('doxo_is_authenticated', String(isAuthenticated));
    if (user) {
      localStorage.setItem('doxo_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('doxo_auth_user');
    }
  }, [isAuthenticated, user]);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const triggerPermissionGate = (title?: string, description?: string) => {
    setGateState({
      isOpen: true,
      title: title || '🔒 ფუნქცია შეზღუდულია',
      description:
        description ||
        'ამ ფუნქციის გამოსაყენებლად საჭიროა ადმინისტრატორის მიერ თქვენი პროფილის ვერიფიკაცია და შესაბამისი უფლების მინიჭება.',
    });
  };

  const closePermissionGate = () => {
    setGateState(prev => ({ ...prev, isOpen: false }));
  };

  const isSuperAdmin = Boolean(
    user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL || user?.role === 'admin'
  );

  const isVerified = Boolean(
    isSuperAdmin || user?.status === 'verified'
  );

  const isPendingVerification = Boolean(
    !isSuperAdmin && (!user?.status || user?.status === 'pending_verification')
  );

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (isSuperAdmin) return true;
    if (!user) return false;
    if (user.status === 'blocked') return false;
    return Boolean(user.permissions?.[permission]);
  };

  const requirePermission = (
    permission: keyof UserPermissions,
    title?: string,
    description?: string
  ): boolean => {
    if (hasPermission(permission)) {
      return true;
    }
    triggerPermissionGate(title, description);
    return false;
  };

  const login = async (credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 500));

    const email = credentials.emailOrPhone.trim();
    if (!email) {
      return { success: false, error: 'გთხოვთ მიუთითოთ ელ.ფოსტა ან ტელეფონის ნომერი' };
    }

    const isSuper = email.toLowerCase() === SUPER_ADMIN_EMAIL;

    // Try Supabase Auth if configured
    if (isSupabaseConfigured && supabase && email.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password || 'password123',
        });

        if (error) {
          console.warn('Supabase auth warning:', error.message);
          // Fall back to local storage if user not found in supabase
        } else if (data.user) {
          const profile = await fetchSupabaseProfile(data.user.id);
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            DoxoStorage.updateUser(profile);
            closeAuthModal();
            return { success: true };
          }
        }
      } catch (err) {
        console.warn('Supabase login exception, falling back:', err);
      }
    }

    // Local / Fallback Authentication
    const allUsers = DoxoStorage.getAllUsers();
    let foundUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() || u.phone === email
    );

    if (!foundUser) {
      const parts = email.split('@')[0].split('.');
      const first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'მომხმარებელი';
      foundUser = {
        id: `usr_${Date.now()}`,
        firstName: isSuper ? 'ნუკრი' : first,
        lastName: isSuper ? 'ჩაჩავა' : '',
        email: email.includes('@') ? email : (isSuper ? SUPER_ADMIN_EMAIL : `${email}@doxo.ge`),
        phone: !email.includes('@') ? email : '+995 599 00 00 00',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        city: 'თბილისი',
        role: isSuper ? 'admin' : 'user',
        status: isSuper ? 'verified' : 'pending_verification',
        permissions: isSuper ? SUPER_ADMIN_PERMISSIONS : DEFAULT_UNVERIFIED_PERMISSIONS,
        verifiedAt: isSuper ? new Date().toISOString() : undefined,
        verifiedBy: isSuper ? 'System' : undefined,
        preferences: {
          preferredLanguage: 'ka',
          preferredTimeOfDay: 'flexible',
          allowPhoneCalls: true,
          priorityCriteria: 'highest_rated',
          savedAddresses: [],
          favoriteProviderIds: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      DoxoStorage.addUser(foundUser);
    }

    DoxoStorage.updateUser(foundUser);
    setUser(foundUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 650));

    if (!data.fullName.trim()) {
      return { success: false, error: 'გთხოვთ შეიყვანოთ სახელი და გვარი' };
    }
    const email = data.email.trim();
    if (!email && !data.phone.trim()) {
      return { success: false, error: 'გთხოვთ მიუთითოთ ელ.ფოსტა ან ტელეფონი' };
    }

    const isSuper = email.toLowerCase() === SUPER_ADMIN_EMAIL;
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'მომხმარებელი';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      firstName: isSuper ? 'ნუკრი' : firstName,
      lastName: isSuper ? 'ჩაჩავა' : lastName,
      email: email || 'user@doxo.ge',
      phone: data.phone.trim() || '+995 599 00 00 00',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      city: 'თბილისი',
      role: isSuper ? 'admin' : 'user',
      status: isSuper ? 'verified' : 'pending_verification',
      permissions: isSuper ? SUPER_ADMIN_PERMISSIONS : DEFAULT_UNVERIFIED_PERMISSIONS,
      verifiedAt: isSuper ? new Date().toISOString() : undefined,
      verifiedBy: isSuper ? 'System' : undefined,
      preferences: {
        preferredLanguage: 'ka',
        preferredTimeOfDay: 'flexible',
        allowPhoneCalls: true,
        priorityCriteria: 'highest_rated',
        savedAddresses: [
          {
            id: 'addr_1',
            label: 'ჩემი ბინა (თბილისი)',
            district: 'ვაკე',
            addressLine: 'ჭავჭავაძის გამზ. 42',
          },
        ],
        favoriteProviderIds: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try Supabase Auth Sign Up
    if (isSupabaseConfigured && supabase && email.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: data.password || 'password123',
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: data.phone,
            },
          },
        });

        if (!authError && authData.user) {
          newUser.id = authData.user.id;
          await upsertSupabaseProfile(newUser);
        }
      } catch (err) {
        console.warn('Supabase registration fallback:', err);
      }
    }

    DoxoStorage.addUser(newUser);
    DoxoStorage.updateUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    await new Promise(res => setTimeout(res, 500));
    const googleUser: UserProfile = {
      ...DoxoStorage.getUser(),
      firstName: 'გიორგი',
      lastName: 'დოლიძე',
      email: 'giorgi.dolidze@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'user',
      status: 'verified',
      permissions: DEFAULT_VERIFIED_PERMISSIONS,
    };
    DoxoStorage.updateUser(googleUser);
    setUser(googleUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return true;
  };

  const loginAsSuperAdmin = () => {
    const allUsers = DoxoStorage.getAllUsers();
    const adminUser = allUsers.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL) || {
      ...DoxoStorage.getUser(),
      id: 'usr_nukri_admin',
      firstName: 'ნუკრი',
      lastName: 'ჩაჩავა',
      email: SUPER_ADMIN_EMAIL,
      phone: '+995 599 99 99 99',
      role: 'admin' as const,
      status: 'verified' as const,
      permissions: SUPER_ADMIN_PERMISSIONS,
      isBlocked: false,
    };
    DoxoStorage.updateUser(adminUser);
    setUser(adminUser);
    setIsAuthenticated(true);
    closeAuthModal();
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('doxo_auth_user');
    localStorage.setItem('doxo_is_authenticated', 'false');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = DoxoStorage.updateUser(data);
    setUser(updated);
    if (isSupabaseConfigured) {
      upsertSupabaseProfile(updated);
    }
  };

  // Admin Actions
  const verifyUser = async (userId: string) => {
    const allUsers = DoxoStorage.getAllUsers();
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;

    const updatedPermissions: UserPermissions = {
      ...(target.permissions || DEFAULT_UNVERIFIED_PERMISSIONS),
      canUseAI: true,
      canBookTasks: true,
      canViewCatalog: true,
      canAccessDecisionCenter: true,
      canAccessWallet: true,
    };

    const updates: Partial<UserProfile> = {
      status: 'verified',
      permissions: updatedPermissions,
      verifiedAt: new Date().toISOString(),
      verifiedBy: user?.firstName ? `${user.firstName} ${user.lastName}` : 'ადმინისტრატორი',
    };

    DoxoStorage.updateUserById(userId, updates);

    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }

    if (isSupabaseConfigured && target) {
      await upsertSupabaseProfile({ ...target, ...updates });
    }
  };

  const updateUserPermissions = async (userId: string, newPermissions: Partial<UserPermissions>) => {
    const allUsers = DoxoStorage.getAllUsers();
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;

    const mergedPermissions: UserPermissions = {
      ...(target.permissions || DEFAULT_UNVERIFIED_PERMISSIONS),
      ...newPermissions,
    };

    const updates: Partial<UserProfile> = {
      permissions: mergedPermissions,
    };

    DoxoStorage.updateUserById(userId, updates);

    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }

    if (isSupabaseConfigured && target) {
      await upsertSupabaseProfile({ ...target, ...updates });
    }
  };

  const setUserStatus = async (userId: string, status: UserStatus) => {
    const allUsers = DoxoStorage.getAllUsers();
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;

    const updates: Partial<UserProfile> = {
      status,
      isBlocked: status === 'blocked',
    };

    DoxoStorage.updateUserById(userId, updates);

    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }

    if (isSupabaseConfigured && target) {
      await upsertSupabaseProfile({ ...target, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        loginAsSuperAdmin,
        logout,
        updateUser,
        isSuperAdmin,
        isVerified,
        isPendingVerification,
        hasPermission,
        requirePermission,
        verifyUser,
        updateUserPermissions,
        setUserStatus,
        triggerPermissionGate,
      }}
    >
      {children}
      <PermissionGateModal
        isOpen={gateState.isOpen}
        onClose={closePermissionGate}
        featureTitle={gateState.title}
        featureDescription={gateState.description}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
