/**
 * DOXO Privacy Center Service
 * Handles AI memory lifecycle, full data export, anonymization, and account deletion.
 */

import { DoxoStorage } from '../storage/db';

export interface ExportDataBundle {
  exportDate: string;
  user: any;
  tasks: any[];
  bookings: any[];
  homeProfile: any;
  notifications: any[];
}

export class PrivacyService {
  private static isMemoryEnabled: boolean = true;

  static isAIMemoryActive(): boolean {
    const saved = localStorage.getItem('doxo_ai_memory_enabled');
    return saved !== null ? saved === 'true' : true;
  }

  static setAIMemoryActive(enabled: boolean): void {
    localStorage.setItem('doxo_ai_memory_enabled', String(enabled));
    this.isMemoryEnabled = enabled;

    DoxoStorage.logAuditEvent({
      eventType: 'task.created',
      entityId: 'privacy_memory',
      actorId: 'user_active',
      actorRole: 'user',
      actorName: 'მომხმარებელი',
      detailsKa: `AI მეხსიერების რეჟიმი შეიცვალა: ${enabled ? 'ჩართულია' : 'გამორთულია'}`,
    });
  }

  /**
   * Export all user data as a clean JSON file
   */
  static exportUserData(): void {
    const bundle: ExportDataBundle = {
      exportDate: new Date().toISOString(),
      user: DoxoStorage.getUser(),
      tasks: DoxoStorage.getTasks(),
      bookings: DoxoStorage.getBookings(),
      homeProfile: DoxoStorage.getHomeProfile(),
      notifications: DoxoStorage.getNotifications(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `doxo_user_data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    DoxoStorage.logAuditEvent({
      eventType: 'task.created',
      entityId: 'privacy_export',
      actorId: 'user_active',
      actorRole: 'user',
      actorName: 'მომხმარებელი',
      detailsKa: 'მომხმარებელმა ჩამოტვირთა პერსონალური მონაცემების ასლი (JSON)',
    });
  }

  /**
   * Anonymize and safely wipe user data
   */
  static deleteAccount(): void {
    localStorage.clear();
    DoxoStorage.resetToSeed();
    window.location.reload();
  }
}
