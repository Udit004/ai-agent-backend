import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // 5 min TTL

export function cacheResponse(key, value) {
  cache.set(key, value);
}

export function getCachedResponse(key) {
  return cache.get(key);
}