interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let hitsLastHour = 0;
let hourStart = Date.now();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  if (now - hourStart > 3_600_000) {
    hitsLastHour = 0;
    hourStart = now;
  }

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    hitsLastHour += 1;
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - bucket.count };
}

export function rateLimitHits1h(): number {
  return hitsLastHour;
}
