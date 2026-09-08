/**
 * DOXO Server-Side Authorization Guard & Data Boundary Enforcer
 * Enforces role-based permissions and ensures zero cross-tenant data leakage.
 */

import { Task } from '../../types/task';
import { Booking } from '../../types/marketplace';

export type UserRole = 'user' | 'provider' | 'admin' | 'operator';

export interface AuthSession {
  userId: string;
  role: UserRole;
  email: string;
  token?: string;
  expiresAt: number;
}

export class AuthGuard {
  /**
   * Verify if a user is permitted to view or mutate a specific Task
   */
  static canUserAccessTask(session: AuthSession, task: Task): boolean {
    if (session.role === 'admin' || session.role === 'operator') return true;
    if (session.role === 'user' && task.userId === session.userId) return true;
    return false;
  }

  /**
   * Verify if an actor is permitted to view or update a Booking
   */
  static canAccessBooking(session: AuthSession, booking: Booking): boolean {
    if (session.role === 'admin' || session.role === 'operator') return true;
    if (session.role === 'user' && booking.userId === session.userId) return true;
    if (session.role === 'provider' && booking.providerId === session.userId) return true;
    return false;
  }

  /**
   * Ensure a provider only sees precise address details AFTER a booking is confirmed
   * Before confirmation, only the neighborhood/district is exposed.
   */
  static sanitizeLocationForProvider(booking: Booking, fullAddress: string): string {
    const isConfirmedOrBeyond = [
      'confirmed',
      'provider_on_way',
      'arrived',
      'in_progress',
      'completed',
    ].includes(booking.bookingStatus);

    if (isConfirmedOrBeyond) {
      return fullAddress;
    }
    // Location privacy before confirmation: return neighborhood only
    return `${booking.location.split('·')[0].trim()} (ზუსტი მისამართი გაიხსნება დადასტურების შემდეგ)`;
  }

  /**
   * Validate role transitions: A client cannot simply claim 'admin' or 'operator'
   */
  static validateRoleElevation(currentRole: UserRole, targetRole: UserRole): { allowed: boolean; error?: string } {
    if (currentRole === targetRole) return { allowed: true };
    if (targetRole === 'admin' || targetRole === 'operator') {
      return {
        allowed: false,
        error: 'ავტორიზაციის შეცდომა: ადმინისტრატორის უფლებების თვითნებური მინიჭება აკრძალულია.',
      };
    }
    return { allowed: true };
  }

  /**
   * Validate privileged state mutations
   * e.g., a standard user cannot directly mark a booking 'completed' without provider or mutual confirmation
   */
  static canMutateBookingStatus(session: AuthSession, booking: Booking, newStatus: string): boolean {
    if (session.role === 'admin') return true;

    // Providers can update execution milestones
    if (session.role === 'provider' && booking.providerId === session.userId) {
      return ['provider_on_way', 'arrived', 'in_progress', 'completed'].includes(newStatus);
    }

    // Users can request, accept quotes, reschedule, or cancel
    if (session.role === 'user' && booking.userId === session.userId) {
      return ['requested', 'confirmed', 'rescheduling', 'cancelled'].includes(newStatus);
    }

    return false;
  }
}
