import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit({
  key,
  window = 60, // seconds
  limit = 10,   // max requests per window
}: {
  key: string;
  window?: number;
  limit?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / window)}`;

  // Increment the count for this window
  const current = await redis.incr(windowKey);

  if (current === 1) {
    // Set expiry if first request in window
    await redis.expire(windowKey, window);
  }

  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    reset: (Math.floor(now / window) + 1) * window - now,
  };
} 