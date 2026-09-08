import { ServiceCategory } from './task';
import { ProviderVerificationStatus, PricingModel } from './marketplace';

export type VerificationStatus = 'verified' | 'top_provider' | 'fast_response';
export type ProviderAvailability = 'available' | 'busy' | 'offline';

export interface DaySchedule {
  morning: boolean;   // 09:00 - 13:00
  afternoon: boolean; // 13:00 - 18:00
  evening: boolean;   // 18:00 - 21:00
}

export type WeeklySchedule = Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', DaySchedule>;

export interface ProviderPricing {
  min: number;
  max: number;
  baseCalloutFee: number;
  unit: string; // "სამუშაოზე" or "საათში"
}

export interface Provider {
  id: string;
  name: string;
  nameKa: string;
  avatarUrl: string;
  phone: string;
  categories: ServiceCategory[];
  serviceAreas: string[]; // e.g. ["ვაკე", "საბურთალო", "მთაწმინდა", "ვერა", "დიდუბე"]
  rating: number; // 4.7 - 5.0
  reviewCount: number;
  completedJobs: number;
  verificationBadge: VerificationStatus;
  verificationStatus: ProviderVerificationStatus;
  verificationDate?: string;
  documentsStatus: 'approved' | 'pending_review' | 'not_submitted';
  completionRate: number; // e.g. 98.4
  cancellationRate: number; // e.g. 1.2
  responseTimeMinutes: number; // e.g. 4
  pricingModel: PricingModel;
  availability: ProviderAvailability;
  estimatedArrivalMinutes: number;
  pricing: ProviderPricing;
  languages: string[];
  bio: string;
  bioKa: string;
  specialties: string[];
  specialtiesKa: string[];
  completedSimilarTasksCount: number; // e.g. 38 similar tasks
  matchScore?: number; // 0 - 100
  matchReasons?: string[]; // Transparent reasons why DOXO recommended this provider
  matchRationaleKa?: string;
  matchRationaleEn?: string;
  isFavorite?: boolean;
  schedule?: WeeklySchedule;
}

