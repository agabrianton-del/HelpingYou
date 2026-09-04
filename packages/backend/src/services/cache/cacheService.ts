type CacheValue = unknown;

interface CacheEntry<T = CacheValue> {
  value: T;
  expiresAt?: number;
  tags: string[];
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

export class CacheService {
  private readonly store = new Map<string, CacheEntry>();
  private readonly tagIndex = new Map<string, Set<string>>();
  private readonly stats = new Map<string, { hits: number; misses: number }>();
  private connected = true;

  constructor(connectionString: string) {
    this.connected = connectionString.length > 0;
  }

  private isExpired(entry: CacheEntry): boolean {
    return typeof entry.expiresAt === 'number' && entry.expiresAt <= Date.now();
  }

  private ensureStats(key: string): { hits: number; misses: number } {
    const current = this.stats.get(key);
    if (current) {
      return current;
    }

    const next = { hits: 0, misses: 0 };
    this.stats.set(key, next);
    return next;
  }

  private addTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag) ?? new Set<string>();
      keys.add(key);
      this.tagIndex.set(tag, keys);
    }
  }

  private removeTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (!keys) {
        continue;
      }

      keys.delete(key);
      if (keys.size === 0) {
        this.tagIndex.delete(tag);
      }
    }
  }

  public async set<T extends CacheValue = CacheValue>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const previous = this.store.get(key);
    if (previous) {
      this.removeTags(key, previous.tags);
    }

    const expiresAt = typeof options.ttl === 'number' ? Date.now() + options.ttl * 1000 : undefined;
    const tags = options.tags ?? [];

    this.store.set(key, {
      value,
      expiresAt,
      tags,
    });
    this.addTags(key, tags);
  }

  public async get<T extends CacheValue = CacheValue>(key: string): Promise<T | null> {
    const stats = this.ensureStats(key);
    const entry = this.store.get(key);

    if (!entry) {
      stats.misses += 1;
      return null;
    }

    if (this.isExpired(entry)) {
      await this.delete(key);
      stats.misses += 1;
      return null;
    }

    stats.hits += 1;
    return entry.value as T;
  }

  public async delete(key: string): Promise<void> {
    const entry = this.store.get(key);
    if (!entry) {
      return;
    }

    this.removeTags(key, entry.tags);
    this.store.delete(key);
  }

  public async deleteByPattern(pattern: string): Promise<number> {
    const regex = globToRegExp(pattern);
    let deleted = 0;

    for (const key of Array.from(this.store.keys())) {
      if (!regex.test(key)) {
        continue;
      }

      await this.delete(key);
      deleted += 1;
    }

    return deleted;
  }

  public async invalidateByTag(tag: string): Promise<void> {
    const keys = Array.from(this.tagIndex.get(tag) ?? []);
    for (const key of keys) {
      await this.delete(key);
    }
  }

  public async getOrSet<T extends CacheValue = CacheValue>(
    key: string,
    resolver: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await resolver();
    await this.set(key, value, options);
    return value;
  }

  public getStats(key: string): CacheStats | null {
    const stats = this.stats.get(key);

    if (!stats || (stats.hits === 0 && stats.misses === 0)) {
      return null;
    }

    const total = stats.hits + stats.misses;
    return {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: total === 0 ? 0 : stats.hits / total,
    };
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async healthCheck(): Promise<boolean> {
    return this.connected;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
    this.store.clear();
    this.tagIndex.clear();
    this.stats.clear();
  }
}

export const cacheService = new CacheService(process.env.REDIS_URL || 'memory://cache');
