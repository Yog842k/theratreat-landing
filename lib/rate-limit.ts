type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key) || { tokens: 0, last: now };
  // reset window
  if (now - b.last > windowMs) {
    b.tokens = 0;
    b.last = now;
  }
  if (b.tokens >= limit) {
    return { allowed: false, retryAfterMs: windowMs - (now - b.last) };
  }
  b.tokens++;
  buckets.set(key, b);
  return { allowed: true };
}
