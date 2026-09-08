/**
 * DOXO Multi-Channel Notification Service
 * Supports In-App, Web Push, Transactional Email, and SMS with user preference guards and deep links.
 */

import { OperationalNotification } from '../../types/marketplace';

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms';

export interface NotificationPreferences {
  criticalAlerts: boolean; // Cannot be disabled silently
  bookingUpdates: boolean;
  providerMessages: boolean;
  reminders: boolean;
  dailyBrief: boolean;
  frequency: 'instant' | 'daily_digest' | 'mute_marketing';
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  criticalAlerts: true,
  bookingUpdates: true,
  providerMessages: true,
  reminders: true,
  dailyBrief: true,
  frequency: 'instant',
  channels: {
    inApp: true,
    push: false,
    email: true,
    sms: false,
  },
};

export class NotificationService {
  private static userPrefs = new Map<string, NotificationPreferences>();

  static getPreferences(userId: string): NotificationPreferences {
    return this.userPrefs.get(userId) || DEFAULT_NOTIFICATION_PREFERENCES;
  }

  static updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
      criticalAlerts: true, // Safety invariant: Critical security & payment alerts cannot be turned off
    };
    this.userPrefs.set(userId, updated);
    return updated;
  }

  /**
   * Determine whether a notification should be delivered based on type and preferences
   */
  static shouldDeliver(userId: string, type: OperationalNotification['type']): boolean {
    const prefs = this.getPreferences(userId);

    // Critical events always bypass mute
    if (['payment_update', 'dispute_update'].includes(type)) {
      return true;
    }

    if (prefs.frequency === 'mute_marketing' && type === 'new_match') {
      return false;
    }

    if (!prefs.bookingUpdates && ['booking_confirmed', 'booking_changed', 'provider_on_way', 'job_completed'].includes(type)) {
      return false;
    }

    return true;
  }

  /**
   * Format concise transactional email / SMS message
   */
  static generateTransactionalMessage(
    type: OperationalNotification['type'],
    details: { serviceTitle?: string; scheduledTime?: string; price?: number; providerName?: string }
  ): { subject: string; body: string } {
    switch (type) {
      case 'booking_confirmed':
        return {
          subject: `DOXO: ჯავშანი დადასტურებულია (${details.serviceTitle})`,
          body: `თქვენი შეკვეთა '${details.serviceTitle}' დადასტურდა. სპეციალისტი: ${details.providerName}. დრო: ${details.scheduledTime}. თანხა: ${details.price}₾ (დეპოზიტზე).`,
        };
      case 'provider_on_way':
        return {
          subject: `DOXO: ${details.providerName} გზაშია`,
          body: `სპეციალისტი ${details.providerName} მიემართება თქვენი მისამართისკენ.`,
        };
      case 'job_completed':
        return {
          subject: `DOXO: სამუშაო დასრულებულია`,
          body: `'${details.serviceTitle}' წარმატებით შესრულდა. გთხოვთ შეაფასოთ სპეციალისტის მომსახურება.`,
        };
      case 'quote_received':
        return {
          subject: `DOXO: მიღებულია ახალი შეთავაზება`,
          body: `${details.providerName}-მ გამოგიგზავნათ შეთავაზება: ${details.price}₾.`,
        };
      default:
        return {
          subject: 'DOXO შეტყობინება',
          body: 'თქვენს ანგარიშზე არის ახალი მოვლენა.',
        };
    }
  }
}
