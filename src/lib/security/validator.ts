/**
 * DOXO Data Validator & State Machine Enforcer
 * Enforces strict lifecycle transitions and validates user inputs.
 */

import { TaskStatus } from '../../types/task';
import { BookingStatus } from '../../types/marketplace';

// Permitted Task State Transitions
const VALID_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  draft: ['analyzing', 'searching', 'awaiting_confirmation', 'cancelled'],
  analyzing: ['searching', 'options_found', 'awaiting_confirmation', 'awaiting_approval', 'cancelled'],
  searching: ['options_found', 'awaiting_confirmation', 'awaiting_approval', 'cancelled'],
  options_found: ['awaiting_approval', 'awaiting_confirmation', 'cancelled'],
  awaiting_confirmation: ['confirmed', 'awaiting_approval', 'booked', 'cancelled'],
  awaiting_approval: ['approved', 'confirmed', 'cancelled'],
  approved: ['booking', 'booked', 'confirmed', 'cancelled'],
  booking: ['booked', 'confirmed', 'cancelled'],
  booked: ['confirmed', 'provider_on_way', 'cancelled', 'needs_attention'],
  confirmed: ['provider_on_way', 'arrived', 'in_progress', 'cancelled', 'needs_attention'],
  provider_on_way: ['arrived', 'cancelled', 'needs_attention'],
  arrived: ['in_progress', 'cancelled', 'needs_attention'],
  in_progress: ['completed', 'needs_attention', 'cancelled'],
  completed: [], // Terminal state: cannot regress to active or draft!
  cancelled: [], // Terminal state
  needs_attention: ['confirmed', 'in_progress', 'cancelled'],
};

// Permitted Booking State Transitions
const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ['awaiting_provider', 'awaiting_user', 'confirmed', 'cancelled'],
  awaiting_provider: ['awaiting_user', 'confirmed', 'cancelled'],
  awaiting_user: ['confirmed', 'cancelled'],
  confirmed: ['rescheduling', 'provider_on_way', 'arrived', 'in_progress', 'cancelled'],
  rescheduling: ['confirmed', 'cancelled'],
  provider_on_way: ['arrived', 'in_progress', 'cancelled', 'disputed'],
  arrived: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['completed', 'disputed', 'cancelled'],
  completed: ['disputed'], // After completion, only dispute can be raised
  cancelled: [], // Terminal state: cannot revive without new booking
  disputed: ['completed', 'cancelled'],
};

export class Validator {
  /**
   * Validate state transition for Task
   */
  static validateTaskTransition(from: TaskStatus, to: TaskStatus): { valid: boolean; error?: string } {
    if (from === to) return { valid: true };
    const allowed = VALID_TASK_TRANSITIONS[from] || [];
    if (!allowed.includes(to)) {
      return {
        valid: false,
        error: `დაუშვებელი სტატუსის გადასვლა: '${from}' -> '${to}' არ არის მხარდაჭერილი.`,
      };
    }
    return { valid: true };
  }

  /**
   * Validate state transition for Booking
   */
  static validateBookingTransition(from: BookingStatus, to: BookingStatus): { valid: boolean; error?: string } {
    if (from === to) return { valid: true };
    const allowed = VALID_BOOKING_TRANSITIONS[from] || [];
    if (!allowed.includes(to)) {
      return {
        valid: false,
        error: `დაუშვებელი ჯავშნის სტატუსი: '${from}' -> '${to}' ეწინააღმდეგება სისტემის წესებს.`,
      };
    }
    return { valid: true };
  }

  /**
   * Sanitize text input to prevent XSS / malicious tags
   */
  static sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  /**
   * Validate Georgian / International phone format
   */
  static isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?[0-9]{9,15}$/.test(cleaned);
  }

  /**
   * Validate coordinate bounds for Georgia
   */
  static isValidGeorgianCoordinates(lat: number, lng: number): boolean {
    // Georgia approx bounding box: Lat 41.0 to 43.6, Lng 40.0 to 46.8
    return lat >= 41.0 && lat <= 43.8 && lng >= 40.0 && lng <= 47.0;
  }
}
