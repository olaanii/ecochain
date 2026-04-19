class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  getResetTime(identifier: string): number {
    const timestamps = this.requests.get(identifier);
    if (!timestamps || timestamps.length === 0) {
      return 0;
    }

    const oldestTimestamp = Math.min(...timestamps);
    return oldestTimestamp + this.windowMs;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Rate limiters for different use cases
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const transactionRateLimiter = new RateLimiter(5, 60000); // 5 transactions per minute
export const walletActionRateLimiter = new RateLimiter(10, 60000); // 10 wallet actions per minute

export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  rateLimiter: RateLimiter,
  identifier: string
): T {
  return ((...args: any[]) => {
    if (!rateLimiter.canMakeRequest(identifier)) {
      const resetTime = new Date(rateLimiter.getResetTime(identifier));
      throw new Error(
        `Rate limit exceeded. Please try again after ${resetTime.toLocaleTimeString()}`
      );
    }
    return fn(...args);
  }) as T;
}
