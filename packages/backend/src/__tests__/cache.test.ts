import { CacheService } from '@/services/cache/cacheService';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService('redis://localhost:6379');
  });

  afterEach(async () => {
    await cacheService.disconnect();
  });

  describe('set and get', () => {
    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = { message: 'hello world' };

      await cacheService.set(key, value);
      const result = await cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should respect TTL', async () => {
      const key = 'test:ttl';
      const value = { data: 'test' };

      await cacheService.set(key, value, { ttl: 1 });
      let result = await cacheService.get(key);
      expect(result).toEqual(value);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));
      result = await cacheService.get(key);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const key = 'test:delete';
      const value = { data: 'test' };

      await cacheService.set(key, value);
      expect(await cacheService.get(key)).toEqual(value);

      await cacheService.delete(key);
      expect(await cacheService.get(key)).toBeNull();
    });

    it('should delete by pattern', async () => {
      await cacheService.set('users:1', { id: 1 });
      await cacheService.set('users:2', { id: 2 });
      await cacheService.set('posts:1', { id: 1 });

      const deleted = await cacheService.deleteByPattern('users:*');
      expect(deleted).toBe(2);

      expect(await cacheService.get('users:1')).toBeNull();
      expect(await cacheService.get('users:2')).toBeNull();
      expect(await cacheService.get('posts:1')).not.toBeNull();
    });
  });

  describe('tags', () => {
    it('should invalidate by tag', async () => {
      await cacheService.set('user:1', { id: 1 }, { tags: ['users'] });
      await cacheService.set('user:2', { id: 2 }, { tags: ['users'] });
      await cacheService.set('post:1', { id: 1 }, { tags: ['posts'] });

      await cacheService.invalidateByTag('users');

      expect(await cacheService.get('user:1')).toBeNull();
      expect(await cacheService.get('user:2')).toBeNull();
      expect(await cacheService.get('post:1')).not.toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('should get from cache if exists', async () => {
      const key = 'test:getorset';
      const value = { data: 'cached' };

      await cacheService.set(key, value);

      const callFn = jest.fn(async () => ({ data: 'fresh' }));
      const result = await cacheService.getOrSet(key, callFn);

      expect(result).toEqual(value);
      expect(callFn).not.toHaveBeenCalled();
    });

    it('should call function if not in cache', async () => {
      const key = 'test:getorset:new';
      const freshValue = { data: 'fresh' };

      const callFn = jest.fn(async () => freshValue);
      const result = await cacheService.getOrSet(key, callFn);

      expect(result).toEqual(freshValue);
      expect(callFn).toHaveBeenCalled();

      // Verify it's now cached
      const cached = await cacheService.get(key);
      expect(cached).toEqual(freshValue);
    });
  });

  describe('stats', () => {
    it('should track cache hits and misses', async () => {
      const key = 'test:stats';
      await cacheService.set(key, { data: 'test' });

      // Cache hit
      await cacheService.get(key);
      // Cache miss
      await cacheService.get('non-existent');

      const stats = cacheService.getStats(key) as any;
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });

  describe('health', () => {
    it('should check connection health', async () => {
      const isConnected = cacheService.isConnected();
      expect(typeof isConnected).toBe('boolean');

      const health = await cacheService.healthCheck();
      expect(typeof health).toBe('boolean');
    });
  });
});
