import { ServiceCategory, TaskStatus, UrgencyLevel, PriceQuote } from './task';
import { Provider } from './provider';

export type AIMessageType =
  | 'TEXT'
  | 'TASK_PLAN'
  | 'CLARIFICATION'
  | 'PROVIDER_RECOMMENDATION'
  | 'PRICE_COMPARISON'
  | 'CONFIRMATION'
  | 'PROGRESS'
  | 'SUCCESS'
  | 'ERROR'
  | 'FOLLOW_UP';

export interface PlanSubItem {
  id: string;
  category: ServiceCategory;
  titleKa: string;
  titleEn: string;
  timeWindow: string; // e.g. "18:00–20:00"
  estimatedPrice: {
    min: number;
    max: number;
    currency: '₾';
  };
  providerCandidate?: Provider;
  isUpdated?: boolean; // highlight changed items with "განახლებულია"
  status?: 'pending' | 'ready' | 'booked';
}

export interface StructuredPlan {
  id: string;
  targetDate: string; // e.g. "ხვალ" or "შაბათი"
  summaryKa: string;
  summaryEn: string;
  items: PlanSubItem[];
  canBundle: boolean;
  bundleSavingsMinutes: number;
  totalPriceRange: {
    min: number;
    max: number;
    currency: '₾';
  };
  visitsCount: number;
}

export interface ClarificationOption {
  id: string;
  labelKa: string;
  labelEn: string;
  value: string;
  isRecommended?: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'doxo';
  type: AIMessageType;
  contentKa: string;
  contentEn: string;
  timestamp: string; // e.g. "14:20"
  // Optional payloads for structured components
  planPayload?: StructuredPlan;
  clarificationPayload?: {
    questionKa: string;
    questionEn: string;
    options: ClarificationOption[];
    contextReasonKa?: string;
    contextReasonEn?: string;
  };
  providerPayload?: {
    primaryProvider: Provider;
    alternativeProviders?: Provider[];
    matchConfidencePercent: number;
    matchRationaleBulletsKa: string[];
    matchRationaleBulletsEn: string[];
  };
  approvalPayload?: {
    taskTitleKa: string;
    provider: Provider;
    scheduledTime: string;
    location: string;
    price: number;
    currency: '₾';
    cancellationPolicyKa: string;
  };
  progressPayload?: {
    step: number;
    totalSteps: number;
    statusTextKa: string;
    statusTextEn: string;
  };
}
