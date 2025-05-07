import { LRUCache } from "lru-cache";

type CacheValue<T> = {
  data: T;
  timestamp: number;
};

// 创建一个LRU缓存实例，用于API数据缓存
const cache = new LRUCache<string, CacheValue<any>>({
  max: 100, // 最多缓存100个项目
  ttl: 1000 * 60 * 5, // 5分钟缓存过期时间
});

/**
 * 从缓存获取数据，如果缓存不存在则执行获取函数并缓存结果
 * @param key 缓存键名
 * @param fetchFn 数据获取函数
 * @param ttl 缓存时间(毫秒)，默认5分钟
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = 1000 * 60 * 5
): Promise<T> {
  const cachedValue = cache.get(key) as CacheValue<T> | undefined;

  // 如果缓存存在且未过期
  if (cachedValue && Date.now() - cachedValue.timestamp < ttl) {
    return cachedValue.data;
  }

  // 缓存不存在或已过期，执行获取函数
  const data = await fetchFn();

  // 缓存结果
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

/**
 * 清除指定键的缓存
 * @param key 缓存键名
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  cache.clear();
}
