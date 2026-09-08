import { Provider } from '../../types/provider';
import { Task, TaskEvent, TaskStatus } from '../../types/task';
import { LifeInboxItem } from '../../types/inbox';
import { HomeProfile } from '../../types/home';
import { UserProfile } from '../../types/user';
import {
  ServiceCatalogItem,
  Booking,
  Quote,
  AuditEvent,
  OperationalNotification,
  Dispute,
  ChatMessage,
  BookingStatus,
  PaymentStatus,
  AnalyticsEvent,
} from '../../types/marketplace';
import { Validator } from '../security/validator';
import { EventBus } from '../realtime/eventBus';
import {
  initialUser,
  seedUsers,
  seedProviders,
  seedActiveTasks,
  seedHomeProfile,
  seedInboxItems,
  seedServices,
  seedBookings,
  seedQuotes,
  seedAuditEvents,
  seedNotifications,
  seedDisputes,
  seedChatMessages,
} from './seedData';

const STORAGE_KEYS = {
  USER: 'doxo_user',
  USERS: 'doxo_users',
  PROVIDERS: 'doxo_providers',
  TASKS: 'doxo_tasks',
  INBOX: 'doxo_inbox',
  HOME: 'doxo_home',
  SERVICES: 'doxo_services',
  BOOKINGS: 'doxo_bookings',
  QUOTES: 'doxo_quotes',
  CHATS: 'doxo_chats',
  DISPUTES: 'doxo_disputes',
  AUDIT: 'doxo_audit',
  NOTIFICATIONS: 'doxo_notifications',
  ANALYTICS: 'doxo_analytics',
};

const STORAGE_CLEAN_SLATE_KEY = 'doxo_clean_slate_v3_active';

// Auto-purge old mock dummy data on initial load
function runCleanSlatePurge() {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(STORAGE_CLEAN_SLATE_KEY) !== 'true') {
      // Remove all legacy mock tables
      Object.values(STORAGE_KEYS).forEach(k => {
        localStorage.removeItem(k);
      });

      // If stored auth user is not super admin, clear it
      const saved = localStorage.getItem('doxo_auth_user');
      if (saved) {
        try {
          const u = JSON.parse(saved);
          if (u.email?.toLowerCase() !== 'nukrichachava9@gmail.com') {
            localStorage.removeItem('doxo_auth_user');
            localStorage.setItem('doxo_is_authenticated', 'false');
          }
        } catch {
          localStorage.removeItem('doxo_auth_user');
        }
      }

      localStorage.setItem(STORAGE_CLEAN_SLATE_KEY, 'true');
    }
  } catch (e) {
    console.warn('Storage clean slate error:', e);
  }
}

// Run immediately
runCleanSlatePurge();

export class DoxoStorage {
  private static getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Storage get error for ${key}:`, e);
      return fallback;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Storage set error for ${key}:`, e);
    }
  }

  // Force clean slate reset
  static resetToCleanSlate(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('doxo_auth_user');
    localStorage.setItem(STORAGE_CLEAN_SLATE_KEY, 'true');
    window.location.reload();
  }

  // User
  static getUser(): UserProfile {
    return this.getItem<UserProfile>(STORAGE_KEYS.USER, initialUser);
  }

  static updateUser(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const updated = { ...current, ...profile, updatedAt: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.USER, updated);
    return updated;
  }

  // Users Management (Admin)
  static getAllUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>(STORAGE_KEYS.USERS, seedUsers);
  }

  static addUser(newUser: UserProfile): void {
    const users = this.getAllUsers();
    users.unshift(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.logAuditEvent({
      eventType: 'provider.registered',
      entityId: newUser.id,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `ახალი მომხმარებელი დაემატა: ${newUser.firstName} ${newUser.lastName} (${newUser.email}) · როლი: ${newUser.role || 'user'}`,
    });
  }

  static updateUserById(id: string, updates: Partial<UserProfile>): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index >= 0) {
      users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.USERS, users);
      const currentUser = this.getUser();
      if (currentUser.id === id) {
        this.setItem(STORAGE_KEYS.USER, users[index]);
      }
    }
  }

  static deleteUser(id: string): void {
    const users = this.getAllUsers().filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.logAuditEvent({
      eventType: 'task.created',
      entityId: id,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `მომხმარებელი #${id} წაიშალა სისტემიდან`,
    });
  }

  static toggleBlockUser(id: string): void {
    const users = this.getAllUsers();
    const target = users.find(u => u.id === id);
    if (target) {
      target.isBlocked = !target.isBlocked;
      target.updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.USERS, users);
      this.logAuditEvent({
        eventType: 'task.created',
        entityId: id,
        actorId: 'usr_admin',
        actorRole: 'admin',
        actorName: 'ადმინისტრატორი',
        detailsKa: `მომხმარებლის #${id} სტატუსი: ${target.isBlocked ? 'დაბლოკილია' : 'აქტიურია'}`,
      });
    }
  }

  // Providers
  static getProviders(): Provider[] {
    return this.getItem<Provider[]>(STORAGE_KEYS.PROVIDERS, seedProviders);
  }

  static getProviderById(id: string): Provider | undefined {
    return this.getProviders().find(p => p.id === id);
  }

  static getFavoriteProviders(): Provider[] {
    return this.getProviders().filter(p => p.isFavorite || p.rating >= 4.9).slice(0, 3);
  }

  static updateProviderAvailability(id: string, availability: Provider['availability']): void {
    const providers = this.getProviders();
    const updated = providers.map(p => p.id === id ? { ...p, availability } : p);
    this.setItem(STORAGE_KEYS.PROVIDERS, updated);
  }

  static addProvider(newProvider: Provider): void {
    const providers = this.getProviders();
    providers.unshift(newProvider);
    this.setItem(STORAGE_KEYS.PROVIDERS, providers);
    this.logAuditEvent({
      eventType: 'provider.registered',
      entityId: newProvider.id,
      actorId: newProvider.id,
      actorRole: 'provider',
      actorName: newProvider.nameKa,
      detailsKa: `ახალი სპეციალისტი დარეგისტრირდა: ${newProvider.nameKa} (${newProvider.categories.join(', ')})`,
    });
  }

  static updateProviderVerification(id: string, status: Provider['verificationStatus']): void {
    const providers = this.getProviders();
    const updated = providers.map(p => {
      if (p.id === id) {
        return {
          ...p,
          verificationStatus: status,
          verificationBadge: status === 'verified' ? ('verified' as const) : p.verificationBadge,
          verificationDate: status === 'verified' ? new Date().toISOString().split('T')[0] : p.verificationDate,
          documentsStatus: status === 'verified' ? ('approved' as const) : p.documentsStatus,
        };
      }
      return p;
    });
    this.setItem(STORAGE_KEYS.PROVIDERS, updated);
    this.logAuditEvent({
      eventType: 'provider.verified',
      entityId: id,
      actorId: 'admin_sys',
      actorRole: 'admin',
      actorName: 'DOXO Trust & Safety',
      detailsKa: `სპეციალისტის ვერიფიკაციის სტატუსი შეიცვალა: ${status}`,
    });
  }

  static updateProvider(id: string, updates: Partial<Provider>): void {
    const providers = this.getProviders();
    const index = providers.findIndex(p => p.id === id);
    if (index >= 0) {
      providers[index] = { ...providers[index], ...updates };
      this.setItem(STORAGE_KEYS.PROVIDERS, providers);
    }
  }

  static deleteProvider(id: string): void {
    const providers = this.getProviders().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROVIDERS, providers);
    this.logAuditEvent({
      eventType: 'task.created',
      entityId: id,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `სპეციალისტი #${id} წაიშალა სისტემიდან`,
    });
  }

  // Tasks
  static getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS, seedActiveTasks);
  }

  static getTaskById(id: string): Task | undefined {
    return this.getTasks().find(t => t.id === id);
  }

  static saveTask(task: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      tasks[index] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.unshift(task);
      this.logAuditEvent({
        eventType: 'task.created',
        entityId: task.id,
        actorId: task.userId,
        actorRole: 'user',
        actorName: 'მომხმარებელი',
        detailsKa: `შეიქმნა დავალება: "${task.titleKa}"`,
      });
      this.logAnalyticsEvent('task_created', { taskId: task.id, category: task.category });
    }
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  static updateTaskStatus(taskId: string, newStatus: TaskStatus, eventTitle?: string, eventTitleKa?: string): Task | undefined {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return undefined;

    // Strict State Machine Validation (Section 8)
    const transitionCheck = Validator.validateTaskTransition(task.status, newStatus);
    if (!transitionCheck.valid) {
      console.warn(`[State Machine Blocked] ${transitionCheck.error}`);
      return undefined;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEvent: TaskEvent = {
      id: `ev_${Date.now()}`,
      time: timeStr,
      title: eventTitle || `Status changed to ${newStatus}`,
      titleKa: eventTitleKa || `სტატუსი: ${newStatus}`,
      actor: newStatus === 'booked' ? 'user' : 'provider',
      statusAfter: newStatus,
    };

    task.status = newStatus;
    task.timeline = [...task.timeline, newEvent];
    task.updatedAt = now.toISOString();

    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return task;
  }

  static deleteTask(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    this.logAuditEvent({
      eventType: 'task.created',
      entityId: id,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `დავალება #${id} წაიშალა სისტემიდან`,
    });
  }

  // Services Catalog
  static getServices(): ServiceCatalogItem[] {
    return this.getItem<ServiceCatalogItem[]>(STORAGE_KEYS.SERVICES, seedServices);
  }

  static getServicesByCategory(category: string): ServiceCatalogItem[] {
    return this.getServices().filter(s => s.category === category);
  }

  static addService(service: ServiceCatalogItem): void {
    const services = this.getServices();
    services.unshift(service);
    this.setItem(STORAGE_KEYS.SERVICES, services);
    this.logAuditEvent({
      eventType: 'task.created',
      entityId: service.id,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `ახალი სერვისი დაემატა: ${service.nameKa} (${service.category})`,
    });
  }

  static updateService(id: string, updates: Partial<ServiceCatalogItem>): void {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === id);
    if (index >= 0) {
      services[index] = { ...services[index], ...updates };
      this.setItem(STORAGE_KEYS.SERVICES, services);
    }
  }

  static deleteService(id: string): void {
    const services = this.getServices().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SERVICES, services);
    this.logAuditEvent({
      eventType: 'task.created',
      entityId: id,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `სერვისი #${id} წაიშალა კატალოგიდან`,
    });
  }

  // Bookings
  static getBookings(): Booking[] {
    return this.getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, seedBookings);
  }

  static getBookingById(id: string): Booking | undefined {
    return this.getBookings().find(b => b.bookingId === id);
  }

  static saveBooking(booking: Booking): void {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.bookingId === booking.bookingId);
    if (index >= 0) {
      bookings[index] = { ...booking, updatedAt: new Date().toISOString() };
    } else {
      bookings.unshift(booking);
      this.logAuditEvent({
        eventType: 'booking.created',
        entityId: booking.bookingId,
        actorId: booking.userId,
        actorRole: 'user',
        actorName: 'მომხმარებელი',
        detailsKa: `შეიქმნა ჯავშანი #${booking.bookingId}: ${booking.serviceTitleKa} (${booking.providerNameKa}, ${booking.price}₾)`,
      });
      this.logAnalyticsEvent('booking_created', {
        bookingId: booking.bookingId,
        providerId: booking.providerId,
        price: booking.price,
      });

      // Also create operational notification for provider
      this.addNotification({
        targetRole: 'provider',
        type: 'booking_confirmed',
        titleKa: 'ახალი დადასტურებული ვიზიტი',
        messageKa: `${booking.serviceTitleKa} · ${booking.scheduledStart} · ${booking.location}`,
        deepLinkTab: 'bookings',
        bookingId: booking.bookingId,
        taskId: booking.taskId,
        read: false,
      });
    }
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
  }

  static updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    paymentStatus?: PaymentStatus,
    detailsKa?: string
  ): Booking | undefined {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.bookingId === bookingId);
    if (!booking) return undefined;

    // Strict State Machine Validation (Section 8)
    const transitionCheck = Validator.validateBookingTransition(booking.bookingStatus, newStatus);
    if (!transitionCheck.valid) {
      console.warn(`[Booking State Blocked] ${transitionCheck.error}`);
      return undefined;
    }

    booking.bookingStatus = newStatus;
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    booking.updatedAt = new Date().toISOString();

    // Map booking status to task status if task exists
    if (booking.taskId) {
      const taskStatusMap: Record<BookingStatus, TaskStatus | undefined> = {
        requested: 'awaiting_confirmation',
        awaiting_provider: 'awaiting_confirmation',
        awaiting_user: 'awaiting_approval',
        confirmed: 'confirmed',
        rescheduling: 'needs_attention',
        provider_on_way: 'provider_on_way',
        arrived: 'arrived',
        in_progress: 'in_progress',
        completed: 'completed',
        cancelled: 'cancelled',
        disputed: 'needs_attention',
      };
      const mappedTaskStatus = taskStatusMap[newStatus];
      if (mappedTaskStatus) {
        this.updateTaskStatus(booking.taskId, mappedTaskStatus, undefined, detailsKa);
      }
    }

    // Audit log
    const auditTypeMap: Record<string, AuditEvent['eventType']> = {
      provider_on_way: 'provider.on_way',
      arrived: 'provider.arrived',
      in_progress: 'provider.started',
      completed: 'booking.completed',
      cancelled: 'booking.cancelled',
    };
    if (auditTypeMap[newStatus]) {
      this.logAuditEvent({
        eventType: auditTypeMap[newStatus],
        entityId: bookingId,
        actorId: booking.providerId,
        actorRole: 'provider',
        actorName: booking.providerNameKa,
        detailsKa: detailsKa || `ჯავშნის სტატუსი: ${newStatus}`,
      });
    }

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    EventBus.emit('booking.updated', booking);
    return booking;
  }

  static rescheduleBooking(bookingId: string, newTime: string): Booking | undefined {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.bookingId === bookingId);
    if (!booking) return undefined;

    const oldTime = booking.scheduledStart;
    booking.rescheduleHistory = booking.rescheduleHistory || [];
    booking.rescheduleHistory.push({
      from: oldTime,
      to: newTime,
      timestamp: new Date().toISOString(),
    });
    booking.scheduledStart = newTime;
    booking.bookingStatus = 'confirmed';
    booking.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      eventType: 'booking.rescheduled',
      entityId: bookingId,
      actorId: booking.userId,
      actorRole: 'user',
      actorName: 'მომხმარებელი',
      detailsKa: `ვიზიტი გადაიტანეს: "${oldTime}"-დან "${newTime}"-ზე`,
    });

    this.addNotification({
      targetRole: 'provider',
      type: 'booking_changed',
      titleKa: 'ვიზიტის დრო შეიცვალა',
      messageKa: `ახალი დრო: ${newTime} (${booking.serviceTitleKa})`,
      deepLinkTab: 'bookings',
      bookingId,
      read: false,
    });

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return booking;
  }

  static cancelBooking(bookingId: string, reason: string): Booking | undefined {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.bookingId === bookingId);
    if (!booking) return undefined;

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      eventType: 'booking.cancelled',
      entityId: bookingId,
      actorId: booking.userId,
      actorRole: 'user',
      actorName: 'მომხმარებელი',
      detailsKa: `ჯავშანი გაუქმდა. მიზეზი: ${reason}`,
    });

    this.logAnalyticsEvent('booking_cancelled', { bookingId, reason });

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return booking;
  }

  static deleteBooking(bookingId: string): void {
    const bookings = this.getBookings().filter(b => b.bookingId !== bookingId);
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.logAuditEvent({
      eventType: 'booking.cancelled',
      entityId: bookingId,
      actorId: 'usr_admin',
      actorRole: 'admin',
      actorName: 'ადმინისტრატორი',
      detailsKa: `ჯავშანი #${bookingId} წაიშალა ადმინის მიერ`,
    });
  }

  // Quotes
  static getQuotes(): Quote[] {
    return this.getItem<Quote[]>(STORAGE_KEYS.QUOTES, seedQuotes);
  }

  static getQuotesForTask(taskId: string): Quote[] {
    return this.getQuotes().filter(q => q.taskId === taskId);
  }

  static createQuote(quote: Omit<Quote, 'id' | 'createdAt'>): Quote {
    const quotes = this.getQuotes();
    const newQuote: Quote = {
      ...quote,
      id: `quote_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    quotes.unshift(newQuote);
    this.setItem(STORAGE_KEYS.QUOTES, quotes);

    this.logAuditEvent({
      eventType: 'quote.created',
      entityId: newQuote.id,
      actorId: newQuote.providerId,
      actorRole: 'provider',
      actorName: newQuote.providerNameKa,
      detailsKa: `შეთავაზება გაიგზავნა: ${newQuote.serviceTitleKa} (${newQuote.price}₾)`,
    });

    this.addNotification({
      targetRole: 'user',
      type: 'quote_received',
      titleKa: 'ახალი შეთავაზება',
      messageKa: `${newQuote.providerNameKa}-მ შემოგთავაზათ ${newQuote.price}₾`,
      deepLinkTab: 'tasks',
      taskId: newQuote.taskId,
      read: false,
    });

    return newQuote;
  }

  static updateQuoteStatus(quoteId: string, status: Quote['status']): Quote | undefined {
    const quotes = this.getQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return undefined;

    quote.status = status;
    this.setItem(STORAGE_KEYS.QUOTES, quotes);

    if (status === 'accepted') {
      this.logAuditEvent({
        eventType: 'quote.accepted',
        entityId: quoteId,
        actorId: 'user_active',
        actorRole: 'user',
        actorName: 'მომხმარებელი',
        detailsKa: `შეთავაზება მიღებულია (${quote.price}₾, ${quote.providerNameKa})`,
      });
      this.logAnalyticsEvent('quote_accepted', { quoteId, price: quote.price });
    }

    return quote;
  }

  // Chat Messages
  static getChatMessages(bookingId: string): ChatMessage[] {
    const all = this.getItem<ChatMessage[]>(STORAGE_KEYS.CHATS, seedChatMessages);
    return all.filter(m => m.bookingId === bookingId);
  }

  static sendChatMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
    const all = this.getItem<ChatMessage[]>(STORAGE_KEYS.CHATS, seedChatMessages);
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.push(newMsg);
    this.setItem(STORAGE_KEYS.CHATS, all);
    return newMsg;
  }

  // Disputes
  static getDisputes(): Dispute[] {
    return this.getItem<Dispute[]>(STORAGE_KEYS.DISPUTES, seedDisputes);
  }

  static createDispute(dispute: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Dispute {
    const disputes = this.getDisputes();
    const newDispute: Dispute = {
      ...dispute,
      id: `disp_${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    disputes.unshift(newDispute);
    this.setItem(STORAGE_KEYS.DISPUTES, disputes);

    this.logAuditEvent({
      eventType: 'dispute.filed',
      entityId: newDispute.id,
      actorId: newDispute.userId,
      actorRole: 'user',
      actorName: newDispute.userName,
      detailsKa: `დაფიქსირდა პრობლემა: ${newDispute.reasonKa} (${newDispute.providerName})`,
    });

    return newDispute;
  }

  static updateDisputeStatus(disputeId: string, status: Dispute['status'], resolutionNotesKa?: string): Dispute | undefined {
    const disputes = this.getDisputes();
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return undefined;

    dispute.status = status;
    if (resolutionNotesKa) {
      dispute.resolutionNotesKa = resolutionNotesKa;
    }
    dispute.updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.DISPUTES, disputes);
    return dispute;
  }

  // Notifications
  static getNotifications(): OperationalNotification[] {
    return this.getItem<OperationalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, seedNotifications);
  }

  static addNotification(notif: Omit<OperationalNotification, 'id' | 'createdAt'>): void {
    const notifs = this.getNotifications();
    notifs.unshift({
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // Audit Events
  static getAuditEvents(): AuditEvent[] {
    return this.getItem<AuditEvent[]>(STORAGE_KEYS.AUDIT, seedAuditEvents);
  }

  static logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const events = this.getAuditEvents();
    events.unshift({
      ...event,
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.AUDIT, events.slice(0, 100)); // cap at 100
  }

  // Analytics Events
  static getAnalyticsEvents(): AnalyticsEvent[] {
    return this.getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
  }

  static logAnalyticsEvent(event: AnalyticsEvent['event'], properties: Record<string, any> = {}): void {
    const events = this.getAnalyticsEvents();
    events.unshift({
      id: `an_${Date.now()}`,
      event,
      properties,
      timestamp: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.ANALYTICS, events.slice(0, 200));
  }

  // Life Inbox
  static getInboxItems(): LifeInboxItem[] {
    return this.getItem<LifeInboxItem[]>(STORAGE_KEYS.INBOX, seedInboxItems);
  }

  static addInboxItem(item: LifeInboxItem): void {
    const items = this.getInboxItems();
    items.unshift(item);
    this.setItem(STORAGE_KEYS.INBOX, items);
  }

  static updateInboxStatus(id: string, status: LifeInboxItem['status']): void {
    const items = this.getInboxItems();
    const updated = items.map(i => i.id === id ? { ...i, status } : i);
    this.setItem(STORAGE_KEYS.INBOX, updated);
  }

  // Home Profile
  static getHomeProfile(): HomeProfile {
    return this.getItem<HomeProfile>(STORAGE_KEYS.HOME, seedHomeProfile);
  }

  static resetToSeed(): void {
    localStorage.clear();
    this.setItem(STORAGE_KEYS.USER, initialUser);
    this.setItem(STORAGE_KEYS.PROVIDERS, seedProviders);
    this.setItem(STORAGE_KEYS.TASKS, seedActiveTasks);
    this.setItem(STORAGE_KEYS.INBOX, seedInboxItems);
    this.setItem(STORAGE_KEYS.HOME, seedHomeProfile);
    this.setItem(STORAGE_KEYS.SERVICES, seedServices);
    this.setItem(STORAGE_KEYS.BOOKINGS, seedBookings);
    this.setItem(STORAGE_KEYS.QUOTES, seedQuotes);
    this.setItem(STORAGE_KEYS.CHATS, seedChatMessages);
    this.setItem(STORAGE_KEYS.DISPUTES, seedDisputes);
    this.setItem(STORAGE_KEYS.AUDIT, seedAuditEvents);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, seedNotifications);
  }
}
