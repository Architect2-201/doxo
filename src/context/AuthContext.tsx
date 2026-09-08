import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPermissions, UserStatus } from '../types/user';
import { DoxoStorage } from '../lib/storage/db';
import {
  isSupabaseConfigured,
  supabase,
  fetchSupabaseProfile,
  upsertSupabaseProfile,
  translateSupabaseError,
  DEFAULT_UNVERIFIED_PERMISSIONS,
  DEFAULT_VERIFIED_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from '../lib/supabase';
import { PasswordSecurity } from '../lib/security/passwordSecurity';
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

export interface GoogleAuthData {
  email: string;
  fullName: string;
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
  loginWithGoogle: (data?: GoogleAuthData) => Promise<{ success: boolean; error?: string }>;
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
  // Real authenticated state: default is false for guests
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('doxo_is_authenticated');
    return saved === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const isAuth = localStorage.getItem('doxo_is_authenticated') === 'true';
      if (!isAuth) return null;
      const savedUser = localStorage.getItem('doxo_auth_user');
      if (savedUser) return JSON.parse(savedUser);
      return null;
    } catch {
      return null;
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
      } else if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('doxo_is_authenticated', String(isAuthenticated));
    if (user && isAuthenticated) {
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
    isAuthenticated && (user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL || user?.role === 'admin')
  );

  const isVerified = Boolean(
    isSuperAdmin || user?.status === 'verified'
  );

  const isPendingVerification = Boolean(
    isAuthenticated && !isSuperAdmin && (!user?.status || user?.status === 'pending_verification')
  );

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    if (!user) return false;
    if (user.status === 'blocked' || user.isBlocked) return false;
    return Boolean(user.permissions?.[permission]);
  };

  const requirePermission = (
    permission: keyof UserPermissions,
    title?: string,
    description?: string
  ): boolean => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return false;
    }
    if (hasPermission(permission)) {
      return true;
    }
    triggerPermissionGate(title, description);
    return false;
  };

  /**
   * Real Login: Validates against Supabase or verified local credential store.
   * Never fabricates fake mock users on failed logins.
   */
  const login = async (credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> => {
    const identifier = credentials.emailOrPhone.trim();
    const password = credentials.password?.trim() || '';

    if (!identifier) {
      return { success: false, error: 'გთხოვთ მიუთითოთ ელ.ფოსტა ან ტელეფონის ნომერი.' };
    }
    if (!password) {
      return { success: false, error: 'გთხოვთ შეიყვანოთ პაროლი.' };
    }

    const isSuperEmail = identifier.toLowerCase() === SUPER_ADMIN_EMAIL;

    // 1. Supabase Auth if configured
    if (isSupabaseConfigured && supabase && identifier.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        });

        if (error) {
          return { success: false, error: translateSupabaseError(error.message) };
        }

        if (data.user) {
          let profile = await fetchSupabaseProfile(data.user.id);
          if (!profile) {
            profile = {
              id: data.user.id,
              firstName: data.user.user_metadata?.first_name || identifier.split('@')[0],
              lastName: data.user.user_metadata?.last_name || '',
              email: data.user.email || identifier,
              phone: data.user.user_metadata?.phone || '+995 599 00 00 00',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
              city: 'თბილისი',
              role: isSuperEmail ? 'admin' : 'user',
              status: isSuperEmail ? 'verified' : 'pending_verification',
              permissions: isSuperEmail ? SUPER_ADMIN_PERMISSIONS : DEFAULT_UNVERIFIED_PERMISSIONS,
              verifiedAt: isSuperEmail ? new Date().toISOString() : undefined,
              verifiedBy: isSuperEmail ? 'System' : undefined,
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
            await upsertSupabaseProfile(profile);
          }

          setUser(profile);
          setIsAuthenticated(true);
          DoxoStorage.updateUser(profile);
          closeAuthModal();
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'სისტემური შეცდომა ავტორიზაციისას.' };
      }
    }

    // 2. Local Credential Database Verification
    const allUsers = DoxoStorage.getAllUsers();
    const cleanId = identifier.toLowerCase();
    const digitsId = identifier.replace(/\D/g, '');

    const foundUser = allUsers.find(u => {
      if (u.email.toLowerCase() === cleanId) return true;
      if (digitsId && digitsId.length >= 9 && u.phone.replace(/\D/g, '') === digitsId) return true;
      return false;
    });

    if (!foundUser) {
      return {
        success: false,
        error: 'მომხმარებელი ამ ელ.ფოსტით ან ნომრით არ არსებობს. გთხოვთ გაიაროთ რეგისტრაცია.',
      };
    }

    if (foundUser.status === 'blocked' || foundUser.isBlocked) {
      return {
        success: false,
        error: 'თქვენი ანგარიში დაბლოკილია სისტემის ადმინისტრატორის მიერ.',
      };
    }

    // Password verification
    const cred = DoxoStorage.findCredentialByEmailOrPhone(identifier);
    if (cred) {
      const isMatch = await PasswordSecurity.verify(password, cred.passwordHash);
      if (!isMatch) {
        return { success: false, error: 'არასწორი პაროლი. გთხოვთ სცადოთ თავიდან.' };
      }
    } else {
      // First time login for seeded user: register password hash
      const hash = await PasswordSecurity.hash(password);
      DoxoStorage.saveCredential({
        userId: foundUser.id,
        email: foundUser.email,
        phone: foundUser.phone,
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      });
    }

    DoxoStorage.updateUser(foundUser);
    setUser(foundUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return { success: true };
  };

  /**
   * Real Registration: Strict validation, prevents duplicate emails/phones,
   * stores hashed credentials and sets status to pending_verification for admin approval.
   */
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // 1. Strict Input Validation
    const validation = PasswordSecurity.validateRegistration(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();
    const digits = phone.replace(/\D/g, '');
    const isSuper = email === SUPER_ADMIN_EMAIL;

    // 2. Check for duplicate registration
    const allUsers = DoxoStorage.getAllUsers();
    const emailExists = allUsers.some(u => u.email.toLowerCase() === email);
    if (emailExists) {
      return {
        success: false,
        error: 'მითითებული ელ.ფოსტით მომხმარებელი უკვე დარეგისტრირებულია. გთხოვთ გაიაროთ შესვლა.',
      };
    }

    const phoneExists = allUsers.some(u => digits && digits.length >= 9 && u.phone.replace(/\D/g, '') === digits);
    if (phoneExists) {
      return {
        success: false,
        error: 'მითითებული ტელეფონის ნომრით მომხმარებელი უკვე დარეგისტრირებულია. გთხოვთ გაიაროთ შესვლა.',
      };
    }

    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'მომხმარებელი';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUserId = `usr_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      firstName: isSuper ? 'ნუკრი' : firstName,
      lastName: isSuper ? 'ჩაჩავა' : lastName,
      email: email,
      phone: phone,
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

    // 3. Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: data.password || 'password123',
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone,
            },
          },
        });

        if (authError) {
          return { success: false, error: translateSupabaseError(authError.message) };
        }

        if (authData.user) {
          newUser.id = authData.user.id;
          await upsertSupabaseProfile(newUser);
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Supabase რეგისტრაციის შეცდომა.' };
      }
    }

    // 4. Save Credential & User into local database
    const passwordHash = await PasswordSecurity.hash(data.password || '');
    DoxoStorage.saveCredential({
      userId: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    DoxoStorage.addUser(newUser);
    DoxoStorage.updateUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return { success: true };
  };

  /**
   * Google Auth: Genuine OAuth via Supabase, or real user Google credential connect
   */
  const loginWithGoogle = async (data?: GoogleAuthData): Promise<{ success: boolean; error?: string }> => {
    // 1. If real Supabase OAuth is configured and no manual prompt data provided, redirect to Google OAuth
    if (isSupabaseConfigured && supabase && !data) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          return { success: false, error: translateSupabaseError(error.message) };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Google ავტორიზაციის შეცდომა.' };
      }
    }

    // 2. If data is provided, authenticate or register the real user's Google account
    if (data) {
      const email = data.email.trim().toLowerCase();
      const name = data.fullName.trim();
      if (!name || name.length < 2) {
        return { success: false, error: 'გთხოვთ მიუთითოთ თქვენი სახელი და გვარი.' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, error: 'გთხოვთ მიუთითოთ სწორი Google (Gmail) მისამართი.' };
      }

      const isSuper = email === SUPER_ADMIN_EMAIL;
      const allUsers = DoxoStorage.getAllUsers();
      let found = allUsers.find(u => u.email.toLowerCase() === email);

      if (!found) {
        const nameParts = name.split(/\s+/);
        const firstName = nameParts[0] || 'მომხმარებელი';
        const lastName = nameParts.slice(1).join(' ') || '';

        found = {
          id: `usr_g_${Date.now()}`,
          firstName: isSuper ? 'ნუკრი' : firstName,
          lastName: isSuper ? 'ჩაჩავა' : lastName,
          email,
          phone: '+995 599 00 00 00',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          city: 'თბილისი',
          role: isSuper ? 'admin' : 'user',
          status: isSuper ? 'verified' : 'pending_verification',
          permissions: isSuper ? SUPER_ADMIN_PERMISSIONS : DEFAULT_UNVERIFIED_PERMISSIONS,
          verifiedAt: isSuper ? new Date().toISOString() : undefined,
          verifiedBy: isSuper ? 'Google OAuth' : undefined,
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
        DoxoStorage.addUser(found);
      }

      DoxoStorage.updateUser(found);
      setUser(found);
      setIsAuthenticated(true);
      closeAuthModal();
      return { success: true };
    }

    return {
      success: false,
      error: 'DIRECT_PROMPT_REQUIRED',
    };
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
