import { Redis } from '@upstash/redis';
import type { ScanResult } from './osv-schemas';

// Cache TTL in seconds (15 minutes)
const CACHE_TTL = 15 * 60;

// Create Redis client - will be null if env vars not set
function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    return null;
  }
  
  return new Redis({ url, token });
}

// Generate cache key
export function getCacheKey(pkg: string, ecosystem: string, version?: string): string {
  return `osv:${ecosystem}:${pkg}:${version || 'all'}`;
}

// Get cached result
export async function getCachedResult(key: string): Promise<ScanResult | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  
  try {
    const cached = await redis.get<ScanResult>(key);
    return cached;
  } catch (error) {
    console.error('[v0] Cache get error:', error);
    return null;
  }
}

// Set cached result
export async function setCachedResult(key: string, result: ScanResult): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  
  try {
    await redis.set(key, result, { ex: CACHE_TTL });
  } catch (error) {
    console.error('[v0] Cache set error:', error);
  }
}

// Get cache expiry timestamp
export function getCacheExpiry(): string {
  return new Date(Date.now() + CACHE_TTL * 1000).toISOString();
}

// Check if caching is available
export function isCacheAvailable(): boolean {
  return getRedisClient() !== null;
}
