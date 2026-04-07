// Rate limiting middleware using Cloudflare Durable Objects would be ideal,
// but for simplicity we use an in-memory map per isolate.
// In Workers, each isolate handles multiple requests so this provides
// basic protection without external dependencies.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return; // cleanup every minute
  lastCleanup = now;
  for (const [key, entry] of limits) {
    if (entry.resetAt < now) limits.delete(key);
  }
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 60,
  windowMs: 60_000, // 1 minute
};

export function checkRateLimit(
  request: Request,
  options: Partial<RateLimitOptions> = {},
): Response | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  cleanup();

  // Use IP from CF-Connecting-IP header, fallback to a hash of user agent
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rl:${ip}`;

  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || entry.resetAt < now) {
    limits.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  if (entry.count >= opts.maxRequests) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
      },
    });
  }

  entry.count++;
  return null;
}
