import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const REDO_LIMIT = 3;
const REDO_EXPIRY = 60 * 30; // 30 minutes in seconds

export async function initRedoCounter(userId: string, generationId: string) {
  const key = `redo:${userId}:${generationId}`;
  await redis.set(key, REDO_LIMIT, { ex: REDO_EXPIRY });
}

export async function canRedo(userId: string, generationId: string) {
  const key = `redo:${userId}:${generationId}`;
  const count = await redis.get<number>(key);
  return (count ?? 0) > 0;
}

export async function useRedo(userId: string, generationId: string) {
  const key = `redo:${userId}:${generationId}`;
  const count = await redis.decr(key);
  if (count < 0) {
    // Prevent negative values
    await redis.set(key, 0, { ex: REDO_EXPIRY });
    return false;
  }
  return count >= 0;
} 