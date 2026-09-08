import { ServiceCategory } from './task';

export type ProviderVerificationStatus = 'verified' | 'pending' | 'unverified' | 'suspended';

export type PricingModel = 'fixed' | 'starting_from' | 'price_range' | 'quote_required';

export type PaymentStatus = 
  | 'unpaid' 
  | 'pending'
  | 'authorization_required' 
  | 'authorized' 
  | 'paid' 
  | 'refunded' 
  | 'partially_refunded'
  | 'failed' 
  | 'cancelled';

export type BookingStatus = 
  | 'requested'
  | 'awaiting_provider'
  | 'awaiting_user'
  | 'confirmed'
  | 'rescheduling'
  | 'provider_on_way'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface ServiceCatalogItem {
  id: string;
  name: string;
  nameKa: string;
  category: ServiceCategory;
  description: string;
  descriptionKa: string;
  pricingModel: PricingModel;
  basePrice?: number;
  priceRange?: { min: number; max: number };
  durationHours: number;
  requiredInfo: string[];
  serviceAreas: string[];
  availabilityNoteKa: string;
  iconName?: string;
}

export interface Quote {
  id: string;
  taskId: string;
  providerId: string;
  providerName: string;
  providerNameKa: string;
  providerAvatarUrl: string;
  serviceTitleKa: string;
  price: number;
  pricingModel: 'fixed' | 'quote';
  expectedDurationHours: number;
  expiresAt: string; // ISO or human readable
  notesKa?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
}

export interface Booking {
  bookingId: string;
  taskId: string;
  userId: string;
  providerId: string;
  providerName: string;
  providerNameKa: string;
  providerAvatarUrl: string;
  providerPhone?: string;
  serviceId: string;
  serviceTitleKa: string;
  category: ServiceCategory;
  scheduledStart: string; // e.g. "დღეს · 18:00" or ISO
  scheduledEnd: string;   // e.g. "დღეს · 20:00"
  location: string;
  addressLabel: string; // "ჩემი სახლი", "სამსახური"
  price: number;
  pricingModel: PricingModel;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  rescheduleHistory?: { from: string; to: string; timestamp: string }[];
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: 'user' | 'provider' | 'system';
  senderName: string;
  text: string;
  createdAt: string;
  quickAction?: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  reason: 'not_completed' | 'quality_mismatch' | 'price_discrepancy' | 'no_show' | 'other';
  reasonKa: string;
  description: string;
  evidenceUrl?: string;
  status: 'submitted' | 'under_review' | 'resolved';
  resolutionNotesKa?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalNotification {
  id: string;
  targetRole: 'user' | 'provider' | 'admin';
  type: 
    | 'new_match'
    | 'quote_received'
    | 'booking_confirmed'
    | 'booking_changed'
    | 'provider_on_way'
    | 'provider_arrived'
    | 'job_started'
    | 'job_completed'
    | 'review_requested'
    | 'payment_update'
    | 'dispute_update';
  titleKa: string;
  messageKa: string;
  deepLinkTab?: string;
  taskId?: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  eventType: 
    | 'task.created'
    | 'provider.matched'
    | 'quote.created'
    | 'quote.accepted'
    | 'quote.declined'
    | 'booking.created'
    | 'booking.confirmed'
    | 'booking.rescheduled'
    | 'booking.cancelled'
    | 'payment.authorized'
    | 'provider.on_way'
    | 'provider.arrived'
    | 'provider.started'
    | 'booking.completed'
    | 'review.created'
    | 'dispute.filed'
    | 'decision.resolved'
    | 'provider.registered'
    | 'provider.verified';
  entityId: string;
  actorId: string;
  actorRole: 'user' | 'provider' | 'system' | 'admin';
  actorName: string;
  timestamp: string;
  detailsKa: string;
}

export interface AnalyticsEvent {
  id: string;
  event: 
    | 'task_created'
    | 'task_completed'
    | 'search_started'
    | 'provider_viewed'
    | 'provider_selected'
    | 'quote_requested'
    | 'quote_accepted'
    | 'booking_created'
    | 'booking_cancelled'
    | 'payment_authorized'
    | 'review_created'
    | 'time_saved';
  properties: Record<string, any>;
  timestamp: string;
}
