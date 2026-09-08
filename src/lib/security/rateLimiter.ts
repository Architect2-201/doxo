/**
 * DOXO Client & API Rate Limiter
 * Protects endpoints and user operations from accidental abuse or brute force.
 */

export interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  auth_login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per min
  ai_query: { maxRequests: 25, windowMs: 60 * 1000 }, // 25 per min
  booking_create: { maxRequests: 6, windowMs: 60 * 1000 }, // 6 per min
  payment_attempt: { maxRequests: 4, windowMs: 60 * 1000 }, // 4 per min
  chat_message: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per min
};

interface BucketEntry {
  timestamps: number[];
}

export class RateLimiter {
  private static buckets = new Map<string, BucketEntry>();

  /**
   * Check if an action is allowed for an identifier (IP, userId, or session)
   */
  static check(action: string, identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
    const rule = RATE_LIMIT_RULES[action] || { maxRequests: 20, windowMs: 60 * 1000 };
    const key = `${action}:${identifier}`;
    const now = Date.now();

    const entry = this.buckets.get(key) || { timestamps: [] };

    // Clean up timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter(ts => now - ts < rule.windowMs);

    if (entry.timestamps.length >= rule.maxRequests) {
      const oldest = entry.timestamps[0];
      const waitTimeMs = rule.windowMs - (now - oldest);
      const retryAfterSeconds = Math.max(1, Math.ceil(waitTimeMs / 1000));
      return { allowed: false, retryAfterSeconds };
    }

    entry.timestamps.push(now);
    this.buckets.set(key, entry);
    return { allowed: true };
  }

  /**
   * Reset rate limit bucket (e.g. for testing)
   */
  static reset(action?: string, identifier?: string): void {
    if (action && identifier) {
      this.buckets.delete(`${action}:${identifier}`);
    } else {
      this.buckets.clear();
    }
  }
}
