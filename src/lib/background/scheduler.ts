/**
 * DOXO Background Scheduler & Grounded Daily Brief Engine
 * 
 * Rules:
 * 1. Daily Brief is generated strictly from genuine database tasks, bookings, and reminders.
 * 2. If there are 0 tasks, it displays "დღეს ყველაფერი მშვიდადაა." - never fictional counts!
 * 3. Quote expiration cleanup (marks quotes expired if > 24 hours).
 */

import { DoxoStorage } from '../storage/db';
import { Logger } from '../observability/logger';

export interface DailyBriefInsight {
  headlineKa: string;
  summaryKa: string;
  scheduledVisitsCount: number;
  activeTasksCount: number;
  urgentCount: number;
  recommendationsKa: string[];
}

export class BackgroundScheduler {
  private static timerId: any = null;

  static start(): void {
    if (this.timerId) return;

    // Run periodic tasks every 30 seconds
    this.timerId = setInterval(() => {
      this.runPeriodicCycle();
    }, 30000);

    // Initial run
    this.runPeriodicCycle();
  }

  static stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private static runPeriodicCycle(): void {
    try {
      this.cleanupExpiredQuotes();
    } catch (e) {
      Logger.error('Scheduler', 'Failed during periodic cycle', e);
    }
  }

  /**
   * Automatically mark quotes older than 24h as expired
   */
  static cleanupExpiredQuotes(): void {
    const quotes = DoxoStorage.getQuotes();
    const now = Date.now();
    let expiredCount = 0;

    quotes.forEach(quote => {
      if (quote.status === 'pending') {
        const created = new Date(quote.createdAt).getTime();
        if (now - created > 24 * 60 * 60 * 1000) {
          DoxoStorage.updateQuoteStatus(quote.id, 'expired');
          expiredCount++;
        }
      }
    });

    if (expiredCount > 0) {
      Logger.info('Scheduler', `Marked ${expiredCount} quotes as expired.`);
    }
  }

  /**
   * Compile a 100% Grounded Daily Brief from actual system data
   */
  static generateGroundedDailyBrief(): DailyBriefInsight {
    const tasks = DoxoStorage.getTasks();
    const bookings = DoxoStorage.getBookings();

    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const todayBookings = bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'provider_on_way');
    const urgentTasks = activeTasks.filter(t => t.urgency === 'urgent' || t.urgency === 'high');

    if (activeTasks.length === 0 && todayBookings.length === 0) {
      return {
        headlineKa: 'დღეს ყველაფერი მშვიდადაა',
        summaryKa: 'დღეისთვის აქტიური დავალებები ან დაჯავშნილი ვიზიტები არ გაქვთ.',
        scheduledVisitsCount: 0,
        activeTasksCount: 0,
        urgentCount: 0,
        recommendationsKa: ['შეგიძლიათ დაისვენოთ ან დაგეგმოთ სამომავლო საქმეები.'],
      };
    }

    const recommendations: string[] = [];
    if (todayBookings.length > 0) {
      recommendations.push(`დაგეგმილია ${todayBookings.length} ვიზიტი. შეამოწმეთ ზუსტი დროები.`);
    }
    if (urgentTasks.length > 0) {
      recommendations.push(`${urgentTasks.length} საქმე მოითხოვს ყურადღებას დღეს.`);
    }

    return {
      headlineKa: `დღეს გაქვთ ${activeTasks.length} საქმე და ${todayBookings.length} ვიზიტი`,
      summaryKa: `ყველა პროცესი კონტროლზეა. DOXO კოორდინაციას უწევს შემსრულებლებს.`,
      scheduledVisitsCount: todayBookings.length,
      activeTasksCount: activeTasks.length,
      urgentCount: urgentTasks.length,
      recommendationsKa: recommendations,
    };
  }
}

// Auto-start scheduler
BackgroundScheduler.start();
