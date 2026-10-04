import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const memoryStore: RateLimitStore = {};

// Clean up expired buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(memoryStore)) {
    if (memoryStore[key].resetAt <= now) {
      delete memoryStore[key];
    }
  }
}, 60000);

export function getClientIp(req: VercelRequest): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Enterprise IP and User Rate Limiter
 * @param req Request
 * @param res Response
 * @param limit Max allowed requests within window
 * @param windowMs Window in milliseconds (default 60000ms = 1 min)
 * @param prefix Identifier prefix (e.g. 'auth', 'api')
 * @returns boolean true if request is allowed, false if rate limited (429 sent)
 */
export function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limit: number,
  windowMs: number = 60000,
  prefix: string = 'rate'
): boolean {
  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = memoryStore[key] || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  memoryStore[key] = record;

  const remaining = Math.max(0, limit - record.count);
  const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetSeconds.toString());

  if (record.count > limit) {
    res.setHeader('Retry-After', resetSeconds.toString());
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please retry after ${resetSeconds} seconds.`,
      retryAfter: resetSeconds,
    });
    return false;
  }

  return true;
}
