import { Redis } from '@upstash/redis';

// PartyKit's runtime does not support the `cache` option in fetch
// This custom fetch wrapper removes it before making the request.
const customFetch: typeof fetch = (input, init) => {
  const { cache, ...rest } = init || {};
  return fetch(input, rest);
};

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  fetch: customFetch,
});

export async function getOrSetCache<T>(
  key: string,
  cb: () => Promise<T>,
): Promise<T> {
  const cachedData = await redis.get(key);
  if (cachedData) {
    return cachedData as T;
  }

  const freshData = await cb();
  // Cache for 1 hour
  await redis.set(key, JSON.stringify(freshData), { ex: 3600 });
  return freshData;
}

