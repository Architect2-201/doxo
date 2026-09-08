export type ServiceCategory = 
  | 'cleaning' 
  | 'plumbing' 
  | 'electrician' 
  | 'ac_heating' 
  | 'courier'
  | 'car_wash';

export type TaskStatus = 
  | 'draft'
  | 'analyzing'
  | 'searching'
  | 'options_found'
  | 'awaiting_approval'
  | 'awaiting_confirmation'
  | 'approved'
  | 'booking'
  | 'booked'
  | 'confirmed'
  | 'provider_on_way'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'needs_attention';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface PriceQuote {
  min: number;
  max: number;
  currency: '₾';
  marketStatus: 'below_average' | 'normal_range' | 'above_average' | 'insufficient_data';
  explanationText: string;
}

export interface TaskEvent {
  id: string;
  time: string; // ISO string
  title: string;
  titleKa: string;
  description?: string;
  descriptionKa?: string;
  actor: 'system' | 'ai' | 'user' | 'provider';
  statusAfter: TaskStatus;
}

export interface TaskReview {
  rating: number; // 1 - 5
  tags?: string[]; // e.g. "Fast", "Professional", "Friendly", "Good value", "Would recommend"
  feedbackText?: string;
  createdAt: string;
}

export type TaskPriority = 'low' | 'normal' | 'important' | 'urgent';
export type TaskGroup = 'today' | 'home' | 'errands' | 'family';
export type RecurrenceInterval = 'weekly' | 'monthly' | 'quarterly';

export interface Task {
  id: string;
  userId: string;
  title: string;
  titleKa: string;
  rawPrompt: string;
  category: ServiceCategory;
  status: TaskStatus;
  urgency: UrgencyLevel;
  priority?: TaskPriority;
  group?: TaskGroup;
  location: string;
  preferredTime: string; // e.g. "დღეს · 18:30" or "Tomorrow · 11:00"
  providerId?: string;
  estimatedPrice: PriceQuote;
  finalPrice?: number;
  aiSummary: string;
  aiSummaryKa: string;
  recommendedProviderIds: string[];
  timeline: TaskEvent[];
  review?: TaskReview;
  timeSavedMinutes: number; // e.g. 120 minutes saved
  notes?: string;
  imageUrl?: string;
  audioNoteDuration?: number;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  etaMinutes?: number;
  reminderSetting?: 'before_leaving' | 'evening' | 'day_before' | 'custom';
  createdAt: string;
  updatedAt: string;
}

