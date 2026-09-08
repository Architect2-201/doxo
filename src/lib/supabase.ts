import { createClient } from '@supabase/supabase-js';
import { UserPermissions, UserProfile, UserStatus } from '../types/user';

// Read credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

// Fallback dummy client if credentials aren't set yet to avoid runtime crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as unknown as ReturnType<typeof createClient>);

export const DEFAULT_UNVERIFIED_PERMISSIONS: UserPermissions = {
  canUseAI: false,
  canBookTasks: false,
  canViewCatalog: true, // Can browse
  canAccessDecisionCenter: false,
  canAccessWallet: false,
  canAccessProviderPortal: false,
};

export const DEFAULT_VERIFIED_PERMISSIONS: UserPermissions = {
  canUseAI: true,
  canBookTasks: true,
  canViewCatalog: true,
  canAccessDecisionCenter: true,
  canAccessWallet: true,
  canAccessProviderPortal: false,
};

export const SUPER_ADMIN_PERMISSIONS: UserPermissions = {
  canUseAI: true,
  canBookTasks: true,
  canViewCatalog: true,
  canAccessDecisionCenter: true,
  canAccessWallet: true,
  canAccessProviderPortal: true,
};

/**
 * Fetch a user profile from Supabase profiles table
 */
export async function fetchSupabaseProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      city: data.city || 'თბილისი',
      role: data.role || 'user',
      status: (data.status as UserStatus) || 'pending_verification',
      permissions: data.permissions || DEFAULT_UNVERIFIED_PERMISSIONS,
      verifiedAt: data.verified_at,
      verifiedBy: data.verified_by,
      isBlocked: data.status === 'blocked',
      preferences: data.preferences || {
        preferredLanguage: 'ka',
        preferredTimeOfDay: 'flexible',
        allowPhoneCalls: true,
        priorityCriteria: 'highest_rated',
        savedAddresses: [],
        favoriteProviderIds: [],
      },
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Failed to fetch profile from Supabase:', err);
    return null;
  }
}

/**
 * Sync or create a user profile in Supabase
 */
export async function upsertSupabaseProfile(profile: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      first_name: profile.firstName,
      last_name: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      avatar_url: profile.avatarUrl,
      city: profile.city,
      role: profile.role,
      status: profile.status,
      permissions: profile.permissions,
      verified_at: profile.verifiedAt,
      verified_by: profile.verifiedBy,
      preferences: profile.preferences,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error upserting profile in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error connecting to Supabase:', err);
    return false;
  }
}
