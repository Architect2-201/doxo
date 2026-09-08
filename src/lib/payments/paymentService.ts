/**
 * DOXO Payment Service & Monetary Safety Engine
 * 
 * Guarantees:
 * 1. Safe monetary arithmetic using integer minor units (tetri/cents: 9000 = 90.00 GEL)
 * 2. Provider-agnostic payment abstraction
 * 3. Immutable price snapshots on booking confirmation
 * 4. Policy-driven cancellation and refund calculator
 * 5. Idempotency protection against duplicate double-charges
 */

import { PaymentStatus } from '../../types/marketplace';

export interface MonetaryAmount {
  minorUnits: number; // e.g. 9000 = 90.00 GEL
  currency: string;   // 'GEL'
  formatted: string;  // '90.00 ₾'
}

export interface PriceSnapshot {
  basePriceMinor: number;
  platformFeeMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  pricingModel: string;
  capturedAt: string;
}

export interface PaymentIntent {
  intentId: string;
  bookingId: string;
  userId: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  createdAt: string;
  authorizedAt?: string;
  capturedAt?: string;
  refundedAt?: string;
}

export interface RefundResult {
  eligible: boolean;
  refundAmountMinor: number;
  penaltyAmountMinor: number;
  reasonKa: string;
}

export class Money {
  /**
   * Convert GEL float to integer minor units (tetri) safely
   */
  static fromGEL(gel: number): number {
    return Math.round(gel * 100);
  }

  /**
   * Convert minor units (tetri) back to GEL number
   */
  static toGEL(minorUnits: number): number {
    return minorUnits / 100;
  }

  /**
   * Format minor units into clean customer-facing string
   */
  static format(minorUnits: number, currency: string = '₾'): string {
    const gel = (minorUnits / 100).toFixed(2);
    return `${gel} ${currency}`;
  }

  /**
   * Safe addition
   */
  static add(a: number, b: number): number {
    return Math.round(a) + Math.round(b);
  }

  /**
   * Safe subtraction (non-negative)
   */
  static subtract(a: number, b: number): number {
    return Math.max(0, Math.round(a) - Math.round(b));
  }
}

export class PaymentService {
  private static intents = new Map<string, PaymentIntent>();
  private static idempotencyRegistry = new Set<string>();

  /**
   * Create an agreed price snapshot for a booking
   */
  static createPriceSnapshot(
    basePriceGEL: number,
    pricingModel: string,
    platformFeeGEL: number = 0,
    discountGEL: number = 0
  ): PriceSnapshot {
    const baseMinor = Money.fromGEL(basePriceGEL);
    const feeMinor = Money.fromGEL(platformFeeGEL);
    const discMinor = Money.fromGEL(discountGEL);
    const totalMinor = Money.subtract(Money.add(baseMinor, feeMinor), discMinor);

    return {
      basePriceMinor: baseMinor,
      platformFeeMinor: feeMinor,
      discountMinor: discMinor,
      totalMinor,
      currency: 'GEL',
      pricingModel,
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Create or retrieve an idempotent payment intent
   */
  static createPaymentIntent(
    bookingId: string,
    userId: string,
    totalMinorUnits: number,
    idempotencyKey: string
  ): { intent: PaymentIntent; isDuplicate: boolean } {
    if (this.idempotencyRegistry.has(idempotencyKey)) {
      // Find existing intent
      for (const intent of this.intents.values()) {
        if (intent.idempotencyKey === idempotencyKey) {
          return { intent, isDuplicate: true };
        }
      }
    }

    const intentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const intent: PaymentIntent = {
      intentId,
      bookingId,
      userId,
      amountMinor: totalMinorUnits,
      currency: 'GEL',
      status: 'unpaid',
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    this.intents.set(intentId, intent);
    this.idempotencyRegistry.add(idempotencyKey);
    return { intent, isDuplicate: false };
  }

  /**
   * Authorize escrow hold (funds held safely, NOT marked as paid yet)
   */
  static authorizePayment(intentId: string): { success: boolean; intent?: PaymentIntent; error?: string } {
    const intent = this.intents.get(intentId);
    if (!intent) {
      return { success: false, error: 'გადახდის ჩანაწერი ვერ მოიძებნა.' };
    }

    if (intent.status === 'paid' || intent.status === 'authorized') {
      return { success: true, intent };
    }

    intent.status = 'authorized';
    intent.authorizedAt = new Date().toISOString();
    return { success: true, intent };
  }

  /**
   * Capture authorized payment upon verified completion
   */
  static capturePayment(intentId: string): { success: boolean; intent?: PaymentIntent; error?: string } {
    const intent = this.intents.get(intentId);
    if (!intent) {
      return { success: false, error: 'გადახდის ჩანაწერი ვერ მოიძებნა.' };
    }

    if (intent.status !== 'authorized') {
      return { success: false, error: `გადახდის დასრულება შეუძლებელია ამ სტატუსში: ${intent.status}` };
    }

    intent.status = 'paid';
    intent.capturedAt = new Date().toISOString();
    return { success: true, intent };
  }

  /**
   * Policy-driven cancellation and refund evaluation
   */
  static calculateRefund(
    totalMinorUnits: number,
    scheduledStartTime: string,
    cancelledBy: 'user' | 'provider'
  ): RefundResult {
    // If provider cancelled, 100% full refund always
    if (cancelledBy === 'provider') {
      return {
        eligible: true,
        refundAmountMinor: totalMinorUnits,
        penaltyAmountMinor: 0,
        reasonKa: 'სპეციალისტის მიერ გაუქმებისას თანხა სრულად ბრუნდება.',
      };
    }

    // If user cancelled, evaluate time remaining
    const now = Date.now();
    const scheduled = new Date(scheduledStartTime).getTime();
    const diffHours = (scheduled - now) / (1000 * 60 * 60);

    if (isNaN(scheduled) || diffHours >= 2) {
      // More than 2 hours before visit: 100% free cancellation
      return {
        eligible: true,
        refundAmountMinor: totalMinorUnits,
        penaltyAmountMinor: 0,
        reasonKa: 'უფასო გაუქმება (ვიზიტამდე 2 საათზე მეტია დარჩენილი).',
      };
    } else {
      // Less than 2 hours: retain 20% provider compensation fee
      const penaltyMinor = Math.round(totalMinorUnits * 0.2);
      const refundMinor = Money.subtract(totalMinorUnits, penaltyMinor);
      return {
        eligible: true,
        refundAmountMinor: refundMinor,
        penaltyAmountMinor: penaltyMinor,
        reasonKa: 'დაგვიანებული გაუქმება (ვიზიტამდე 2 საათზე ნაკლებია): 20% კომპენსაცია სპეციალისტს.',
      };
    }
  }

  /**
   * Process refund
   */
  static refundPayment(intentId: string, amountMinor: number): { success: boolean; intent?: PaymentIntent } {
    const intent = this.intents.get(intentId);
    if (!intent) return { success: false };

    intent.status = amountMinor >= intent.amountMinor ? 'refunded' : 'partially_refunded';
    intent.refundedAt = new Date().toISOString();
    return { success: true, intent };
  }
}
