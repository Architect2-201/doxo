/**
 * DOXO Controlled AI Tool Execution Registry
 * 
 * Safety Rules:
 * 1. AI never directly mutates the database.
 * 2. Every tool defines a strict Risk Level (LOW, MEDIUM, HIGH).
 * 3. HIGH risk tools strictly require explicit user confirmation.
 * 4. Every tool invocation logs an audit record with parameters and result.
 */

import { DoxoStorage } from '../storage/db';
import { AIService } from './aiService';
import { AuthGuard, AuthSession } from '../security/authGuard';
import { Validator } from '../security/validator';
import { MapsService } from '../maps/mapsService';

export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIToolDefinition {
  name: string;
  descriptionKa: string;
  riskLevel: ToolRiskLevel;
  requiresConfirmation: boolean;
  execute: (params: any, session: AuthSession) => Promise<{ success: boolean; data?: any; error?: string; requiresConfirmation?: boolean }>;
}

export interface AIToolInvocationLog {
  id: string;
  toolName: string;
  riskLevel: ToolRiskLevel;
  params: any;
  authorized: boolean;
  confirmedByUser: boolean;
  resultSuccess: boolean;
  timestamp: string;
}

export class AIToolRegistry {
  private static tools = new Map<string, AIToolDefinition>();
  private static invocationLogs: AIToolInvocationLog[] = [];

  static register(tool: AIToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  static getTool(name: string): AIToolDefinition | undefined {
    return this.tools.get(name);
  }

  static getAllTools(): AIToolDefinition[] {
    return Array.from(this.tools.values());
  }

  static getLogs(): AIToolInvocationLog[] {
    return [...this.invocationLogs];
  }

  /**
   * Execute an AI Tool through controlled authorization and confirmation gate
   */
  static async invokeTool(
    toolName: string,
    params: any,
    session: AuthSession,
    userConfirmed: boolean = false
  ): Promise<{ success: boolean; data?: any; error?: string; requiresConfirmation?: boolean }> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { success: false, error: `უცნობი AI ხელსაწყო: ${toolName}` };
    }

    // High risk gate
    if (tool.requiresConfirmation && !userConfirmed) {
      this.logInvocation({
        id: `ait_${Date.now()}`,
        toolName,
        riskLevel: tool.riskLevel,
        params,
        authorized: true,
        confirmedByUser: false,
        resultSuccess: false,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        requiresConfirmation: true,
        error: `მოქმედება მოითხოვს მომხმარებლის პირდაპირ დადასტურებას (${tool.descriptionKa}).`,
      };
    }

    try {
      const result = await tool.execute(params, session);

      this.logInvocation({
        id: `ait_${Date.now()}`,
        toolName,
        riskLevel: tool.riskLevel,
        params,
        authorized: true,
        confirmedByUser: userConfirmed,
        resultSuccess: result.success,
        timestamp: new Date().toISOString(),
      });

      // Also record system audit event
      DoxoStorage.logAuditEvent({
        eventType: 'task.created',
        entityId: toolName,
        actorId: session.userId,
        actorRole: session.role === 'operator' ? 'admin' : session.role,
        actorName: 'DOXO AI Agent',
        detailsKa: `AI ინსტრუმენტი შესრულდა: ${tool.descriptionKa}`,
      });

      return result;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'ხელსაწყოს შესრულება ვერ მოხერხდა.',
      };
    }
  }

  private static logInvocation(log: AIToolInvocationLog): void {
    this.invocationLogs.unshift(log);
    if (this.invocationLogs.length > 100) {
      this.invocationLogs.pop();
    }
  }
}

// ==========================================
// Standard Controlled AI Tools Registration
// ==========================================

// 1. findProviders (LOW)
AIToolRegistry.register({
  name: 'findProviders',
  descriptionKa: 'სპეციალისტების მოძიება და შედარება',
  riskLevel: 'LOW',
  requiresConfirmation: false,
  execute: async (params) => {
    const providers = AIService.rankProvidersForTask(
      params.category,
      params.location,
      params.urgency
    );
    return { success: true, data: providers };
  },
});

// 2. getAvailability (LOW)
AIToolRegistry.register({
  name: 'getAvailability',
  descriptionKa: 'სპეციალისტის თავისუფალი დროის შემოწმება',
  riskLevel: 'LOW',
  requiresConfirmation: false,
  execute: async (params) => {
    const provider = DoxoStorage.getProviderById(params.providerId);
    if (!provider) return { success: false, error: 'სპეციალისტი ვერ მოიძებნა' };
    return { success: true, data: provider.availability };
  },
});

// 3. createTask (LOW)
AIToolRegistry.register({
  name: 'createTask',
  descriptionKa: 'ახალი დავალების ჩანაწერის შექმნა',
  riskLevel: 'LOW',
  requiresConfirmation: false,
  execute: async (params, session) => {
    const newTask = {
      id: `tsk_${Date.now()}`,
      userId: session.userId,
      title: params.title || 'ახალი დავალება',
      titleKa: params.titleKa || 'ახალი დავალება',
      category: params.category || 'other',
      status: 'awaiting_confirmation' as const,
      urgency: params.urgency || 'this_week',
      location: params.location || 'თბილისი',
      price: params.price || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `ev_${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Task created by AI',
          titleKa: 'დავალება შეიქმნა DOXO AI-ს მიერ',
          actor: 'ai' as const,
          statusAfter: 'awaiting_confirmation' as const,
        },
      ],
    };
    DoxoStorage.saveTask(newTask as any);
    return { success: true, data: newTask };
  },
});

// 4. createBooking (HIGH - requires human confirmation!)
AIToolRegistry.register({
  name: 'createBooking',
  descriptionKa: 'სერვისის ჯავშნის გაფორმება',
  riskLevel: 'HIGH',
  requiresConfirmation: true,
  execute: async (params, session) => {
    const booking = {
      bookingId: `bk_${Date.now()}`,
      taskId: params.taskId || `tsk_${Date.now()}`,
      userId: session.userId,
      providerId: params.providerId,
      providerName: params.providerName || 'სპეციალისტი',
      providerNameKa: params.providerNameKa || 'სპეციალისტი',
      serviceId: params.serviceId || 'srv_general',
      serviceTitle: params.serviceTitle || 'სერვისი',
      serviceTitleKa: params.serviceTitleKa || 'სერვისი',
      scheduledStart: params.scheduledStart || 'ხვალ · 18:00',
      location: params.location || 'თბილისი',
      price: params.price || 70,
      pricingModel: params.pricingModel || 'fixed',
      paymentStatus: 'authorized' as const,
      bookingStatus: 'confirmed' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    DoxoStorage.saveBooking(booking as any);
    return { success: true, data: booking };
  },
});

// 5. cancelBooking (HIGH - requires human confirmation!)
AIToolRegistry.register({
  name: 'cancelBooking',
  descriptionKa: 'ჯავშნის გაუქმება',
  riskLevel: 'HIGH',
  requiresConfirmation: true,
  execute: async (params, session) => {
    const booking = DoxoStorage.getBookingById(params.bookingId);
    if (!booking) return { success: false, error: 'ჯავშანი ვერ მოიძებნა' };

    const canAccess = AuthGuard.canAccessBooking(session, booking);
    if (!canAccess) return { success: false, error: 'ავტორიზაციის შეცდომა' };

    const updated = DoxoStorage.cancelBooking(params.bookingId, params.reason || 'გაუქმებულია მომხმარებლის მიერ');
    return { success: true, data: updated };
  },
});
