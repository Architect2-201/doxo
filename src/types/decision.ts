import { Provider } from './provider';

export type DecisionCategory =
  | 'provider_choice'
  | 'schedule_conflict'
  | 'quote_comparison'
  | 'price_change'
  | 'recommendation';

export type DecisionStatus = 'pending' | 'completed' | 'dismissed';
export type DecisionUrgency = 'urgent' | 'medium' | 'low'; // urgent = დღეს, medium = მალე, low = მოიცადოს
export type DecisionPriorityPreference = 'price' | 'time' | 'quality';

export interface DecisionOption {
  id: string;
  titleKa: string;
  titleEn: string;
  providerId?: string;
  provider?: Provider;
  price: number; // in GEL
  priceFormatted: string; // e.g. "85 ₾"
  rating?: number; // e.g. 4.9
  reviewCount?: number;
  availableTimeKa: string; // e.g. "დღეს 18:00"
  availableTimeEn: string;
  prosKa: string[];
  prosEn: string[];
  consKa: string[];
  consEn: string[];
  reliabilityScore?: number; // 0 - 100
  isBestValue?: boolean;
  scoreExplanationKa?: string;
  includedServicesKa?: string[];
  notIncludedServicesKa?: string[];
  warrantyKa?: string;
}

export interface TradeoffRule {
  optionAId: string;
  optionBId: string;
  ruleKa: string; // e.g. "თუ დრო უფრო მნიშვნელოვანია → A; თუ ფასი → B"
  ruleEn: string;
}

export interface PriceBreakdownItem {
  labelKa: string;
  labelEn: string;
  amount: number | null; // null represents "დაზუსტდება"
  amountFormatted: string;
  isUnknown?: boolean;
}

export interface PriceInsightData {
  level: 'low' | 'average' | 'high' | 'unknown';
  textKa: string;
  textEn: string;
  benchmarkRangeKa?: string;
  hasSufficientData: boolean;
}

export interface ScheduleConflictData {
  taskA: {
    id: string;
    titleKa: string;
    timeKa: string;
    locationKa: string;
  };
  taskB: {
    id: string;
    titleKa: string;
    timeKa: string;
    locationKa: string;
  };
  overlapDurationKa: string;
  travelTimeEstimateKa?: string;
  suggestions: {
    id: string;
    titleKa: string;
    descriptionKa: string;
    appliedOptionId: string;
  }[];
}

export interface ChangeSummaryData {
  changeType: 'price' | 'time' | 'availability' | 'quote_expiration';
  oldValueKa: string;
  newValueKa: string;
  reasonKa: string;
  expiresAt?: string; // ISO string
  isExpired?: boolean;
}

export interface DocumentExtractedFact {
  serviceTitleKa: string;
  basePriceKa: string;
  extraFeesKa: string;
  termDaysKa: string;
  missingPointsKa: string[];
  confidenceDisclaimerKa: string;
}

export interface DoxoRecommendation {
  recommendedOptionId: string;
  whatKa: string;
  whatEn: string;
  whyKa: string[];
  whyEn: string[];
  tradeoffKa: string;
  tradeoffEn: string;
  nextStepKa: string;
  nextStepEn: string;
  confidenceScore: number; // e.g. 96
  confidenceTextKa: string;
  disclaimerKa: string; // "საბოლოო არჩევანი შენია."
}

export interface DecisionItem {
  id: string;
  titleKa: string;
  titleEn: string;
  category: DecisionCategory;
  status: DecisionStatus;
  urgency: DecisionUrgency;
  deadlineKa?: string;
  deadlineEn?: string;
  contextKa: string;
  contextEn: string;
  doxoRecommendation: DoxoRecommendation;
  options: DecisionOption[];
  tradeoffs?: TradeoffRule[];
  priceBreakdown?: {
    items: PriceBreakdownItem[];
    total: number | null;
    totalFormatted: string;
  };
  priceInsight?: PriceInsightData;
  conflictDetails?: ScheduleConflictData;
  changeDetails?: ChangeSummaryData;
  documentFacts?: DocumentExtractedFact;
  missingInformationKa?: string[];
  userDecision?: {
    selectedOptionId: string;
    decidedAt: string;
    feedback?: 'positive' | 'negative';
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalActionItem {
  id: string;
  type: 'booking' | 'payment' | 'cancellation' | 'external_message' | 'data_sharing' | 'reschedule';
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  costKa?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  entityId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ProductivitySummary {
  weekDecisionsCount: number;
  weekBookingsCount: number;
  weekComparisonsCount: number;
  estimatedHoursSavedFormatted: string; // e.g. "3სთ 15წთ"
  insightsKa: string[];
  insightsEn: string[];
}
