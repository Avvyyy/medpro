// Rate limiting service to prevent API abuse

export interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly cleanupInterval = 60000; // 1 minute

  constructor() {
    // Cleanup expired entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Check if request is allowed under rate limit
  public checkLimit(
    identifier: string,
    rule: RateLimitRule,
    endpoint?: string
  ): RateLimitResult {
    const key = rule.keyGenerator ? rule.keyGenerator(identifier) : `${identifier}:${endpoint || 'default'}`;
    const now = Date.now();
    const windowStart = now - rule.windowMs;

    let requestData = this.requests.get(key);

    // Initialize or reset if window expired
    if (!requestData || requestData.resetTime <= now) {
      requestData = {
        count: 0,
        resetTime: now + rule.windowMs
      };
    }

    // Check if limit exceeded
    if (requestData.count >= rule.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestData.resetTime,
        retryAfter: requestData.resetTime - now
      };
    }

    // Increment counter
    requestData.count++;
    this.requests.set(key, requestData);

    return {
      allowed: true,
      remaining: rule.maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }

  // Record a request (for tracking purposes)
  public recordRequest(
    identifier: string,
    endpoint: string,
    success: boolean,
    rule: RateLimitRule
  ): void {
    if (rule.skipSuccessfulRequests && success) return;
    if (rule.skipFailedRequests && !success) return;

    // The actual limiting is done in checkLimit
    // This method is for additional tracking if needed
  }

  // Get current usage for an identifier
  public getCurrentUsage(identifier: string, endpoint?: string): {
    count: number;
    resetTime: number;
  } | null {
    const key = `${identifier}:${endpoint || 'default'}`;
    return this.requests.get(key) || null;
  }

  // Reset limits for an identifier (admin function)
  public resetLimits(identifier: string, endpoint?: string): void {
    const key = `${identifier}:${endpoint || 'default'}`;
    this.requests.delete(key);
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime <= now) {
        this.requests.delete(key);
      }
    }
  }

  // Get all current limits (for monitoring)
  public getAllLimits(): Array<{
    key: string;
    count: number;
    resetTime: number;
    remaining: number;
  }> {
    const now = Date.now();
    const results: Array<{
      key: string;
      count: number;
      resetTime: number;
      remaining: number;
    }> = [];

    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime > now) {
        results.push({
          key,
          count: data.count,
          resetTime: data.resetTime,
          remaining: Math.max(0, data.resetTime - now)
        });
      }
    }

    return results;
  }
}

// Predefined rate limit rules for different scenarios
export const RATE_LIMIT_RULES = {
  // Authentication endpoints
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true
  },

  // Password reset
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    skipSuccessfulRequests: true
  },

  // General API endpoints
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    skipFailedRequests: false
  },

  // Data export endpoints
  DATA_EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 exports per hour
    skipFailedRequests: true
  },

  // Alert creation
  ALERT_CREATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 alerts per minute
    skipFailedRequests: true
  },

  // Vital signs submission
  VITAL_SIGNS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50, // 50 submissions per minute
    skipFailedRequests: true
  },

  // Patient data access
  PATIENT_ACCESS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 accesses per minute
    skipFailedRequests: true
  }
};

export const rateLimiter = new RateLimiter();

// Middleware function for API calls
export const withRateLimit = async <T>(
  identifier: string,
  rule: RateLimitRule,
  apiCall: () => Promise<T>,
  endpoint?: string
): Promise<T> => {
  const limitResult = rateLimiter.checkLimit(identifier, rule, endpoint);

  if (!limitResult.allowed) {
    const error = new Error('Rate limit exceeded');
    (error as any).rateLimitInfo = limitResult;
    throw error;
  }

  try {
    const result = await apiCall();
    rateLimiter.recordRequest(identifier, endpoint || 'unknown', true, rule);
    return result;
  } catch (error) {
    rateLimiter.recordRequest(identifier, endpoint || 'unknown', false, rule);
    throw error;
  }
};