export type Language = 'ka' | 'en';
export type UserRole = 'user' | 'provider' | 'admin';
export type UserStatus = 'pending_verification' | 'verified' | 'rejected' | 'blocked';

export interface UserPermissions {
  canUseAI: boolean;                // AI ჩატი და ჭკვიანი დამგეგმავი
  canBookTasks: boolean;            // შეკვეთების გაფორმება & დაჯავშნა
  canViewCatalog: boolean;          // ოსტატებისა და სერვისების კატალოგი
  canAccessDecisionCenter: boolean; // გადაწყვეტილების ცენტრი
  canAccessWallet: boolean;         // საფულე, გადახდები & ბარათები
  canAccessProviderPortal: boolean; // ოსტატის / სერვისის მართვის პანელი
}

export interface UserPreferences {
  preferredLanguage: Language;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  allowPhoneCalls: boolean;
  priorityCriteria: 'highest_rated' | 'fastest_arrival' | 'best_value';
  savedAddresses: SavedAddress[];
  defaultAddressId?: string;
  favoriteProviderIds: string[];
}

export interface SavedAddress {
  id: string;
  label: string; // e.g. "ჩემი ბინა (ვაკე)", "ოფისი (საბურთალო)"
  district: string; // e.g. "ვაკე", "საბურთალო", "მთაწმინდა", "დიდუბე", "ისანი"
  addressLine: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  city: string; // "თბილისი" / "Tbilisi"
  role?: UserRole;
  status?: UserStatus;
  permissions?: UserPermissions;
  verifiedAt?: string;
  verifiedBy?: string;
  isBlocked?: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

