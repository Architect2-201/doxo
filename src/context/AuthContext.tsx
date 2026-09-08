import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import { DoxoStorage } from '../lib/storage/db';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check persisted auth status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('doxo_is_authenticated');
    return saved !== null ? saved === 'true' : true; // Default true with seed user, or false if logged out
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

  const login = async (credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> => {
    // Simulate brief network authentication delay
    await new Promise(res => setTimeout(res, 600));

    if (!credentials.emailOrPhone.trim()) {
      return { success: false, error: 'გთხოვთ მიუთითოთ ელ.ფოსტა ან ტელეფონის ნომერი' };
    }

    // Authenticate user
    const SUPER_ADMIN_EMAIL = 'nukrichachava9@gmail.com';
    const isSuperAdminUser = credentials.emailOrPhone.toLowerCase().includes('nukri') || credentials.emailOrPhone.toLowerCase() === SUPER_ADMIN_EMAIL;
    const existing = DoxoStorage.getUser();
    const parts = credentials.emailOrPhone.split('@')[0].split('.');
    const first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : existing.firstName;

    const authenticatedUser: UserProfile = {
      ...existing,
      email: credentials.emailOrPhone.includes('@') ? credentials.emailOrPhone : (isSuperAdminUser ? SUPER_ADMIN_EMAIL : existing.email),
      phone: !credentials.emailOrPhone.includes('@') ? credentials.emailOrPhone : existing.phone,
      firstName: isSuperAdminUser ? 'ნუკრი' : (first || existing.firstName),
      lastName: isSuperAdminUser ? 'ჩაჩავა' : existing.lastName,
      role: isSuperAdminUser ? 'admin' : (existing.role || 'user'),
    };

    DoxoStorage.updateUser(authenticatedUser);
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return { success: true };
  };

  const loginAsSuperAdmin = () => {
    const SUPER_ADMIN_EMAIL = 'nukrichachava9@gmail.com';
    const allUsers = DoxoStorage.getAllUsers();
    const adminUser = allUsers.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL) || {
      ...DoxoStorage.getUser(),
      id: 'usr_nukri_admin',
      firstName: 'ნუკრი',
      lastName: 'ჩაჩავა',
      email: SUPER_ADMIN_EMAIL,
      phone: '+995 599 99 99 99',
      role: 'admin' as const,
      isBlocked: false,
    };
    DoxoStorage.updateUser(adminUser);
    setUser(adminUser);
    setIsAuthenticated(true);
    closeAuthModal();
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 750));

    if (!data.fullName.trim()) {
      return { success: false, error: 'გთხოვთ შეიყვანოთ სახელი და გვარი' };
    }
    if (!data.email.trim() && !data.phone.trim()) {
      return { success: false, error: 'გთხოვთ მიუთითოთ ელ.ფოსტა ან ტელეფონი' };
    }

    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'მომხმარებელი';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      firstName,
      lastName,
      email: data.email.trim() || 'user@doxo.ge',
      phone: data.phone.trim() || '+995 599 00 00 00',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      city: 'თბილისი',
      role: data.email.trim().toLowerCase() === 'nukrichachava9@gmail.com' ? 'admin' : 'user',
      preferences: {
        preferredLanguage: 'ka',
        preferredTimeOfDay: 'flexible',
        allowPhoneCalls: true,
        priorityCriteria: 'highest_rated',
        savedAddresses: [
          {
            id: 'addr_1',
            label: 'ჩემი ბინა (ვაკე)',
            district: 'ვაკე',
            addressLine: 'ჭავჭავაძის გამზ. 42',
          },
        ],
        favoriteProviderIds: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DoxoStorage.updateUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    await new Promise(res => setTimeout(res, 600));
    const googleUser: UserProfile = {
      ...DoxoStorage.getUser(),
      firstName: 'გიორგი',
      lastName: 'დოლიძე',
      email: 'giorgi.dolidze@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'user',
    };
    DoxoStorage.updateUser(googleUser);
    setUser(googleUser);
    setIsAuthenticated(true);
    closeAuthModal();
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('doxo_auth_user');
    localStorage.setItem('doxo_is_authenticated', 'false');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = DoxoStorage.updateUser(data);
    setUser(updated);
  };

  const isSuperAdmin = Boolean(
    user?.email?.toLowerCase() === 'nukrichachava9@gmail.com' || user?.role === 'admin'
  );

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
