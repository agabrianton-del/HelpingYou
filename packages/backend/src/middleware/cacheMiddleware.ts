import { Request, Response, NextFunction } from 'express';
import { cacheService } from '@/services/cache/cacheService';
import { Logger } from '@/utils/logger';
import crypto from 'crypto';

interface CacheOptions {
  ttl?: number; // Cache TTL in seconds
  tags?: string[];
  methods?: string[]; // HTTP methods to cache (default: GET)
  skipIf?: (req: Request) => boolean; // Condition to skip caching
}

const logger = new Logger('CacheMiddleware');

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request): string {
  const baseKey = `${req.method}:${req.path}`;
  const queryString = Object.entries(req.query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const fullPath = queryString ? `${baseKey}?${queryString}` : baseKey;
  const hash = crypto.createHash('sha256').update(fullPath).digest('hex');

  return `http-cache:${hash}`;
}

/**
 * Generate ETag for response
 */
function generateETag(data: any): string {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
  return `"${hash.substring(0, 16)}"`;
}

/**
 * Cache middleware for Express
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 3600,
    tags = [],
    methods = ['GET'],
    skipIf = () => false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-configured methods
    if (!methods.includes(req.method)) {
      return next();
    }

    // Skip if condition is met
    if (skipIf(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req);

    // Intercept response
    const originalJson = res.json.bind(res);
    let cachedData: any = null;

    res.json = function (data: any) {
      cachedData = data;

      // Generate ETag
      const etag = generateETag(data);

      // Set cache headers
      res.set({
        'Cache-Control': `public, max-age=${ttl}`,
        ETag: etag,
        'Last-Modified': new Date().toUTCString(),
      });

      // Check If-None-Match (ETag validation)
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        logger.debug(`Cache validation passed for ${cacheKey}`);
        return res.status(304).end();
      }

      // Store in cache
      if (res.statusCode === 200 || res.statusCode === 201) {
        cacheService
          .set(cacheKey, data, { ttl, tags })
          .catch((err) => logger.error('Error caching response', err));
      }

      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        logger.debug(`Cache HIT for ${cacheKey}`);

        const etag = generateETag(cached);
        res.set({
          'Cache-Control': `public, max-age=${ttl}`,
          ETag: etag,
          'Last-Modified': new Date().toUTCString(),
          'X-Cache': 'HIT',
        });

        // Check If-None-Match (ETag validation)
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch === etag) {
          logger.debug(`Cache validation passed for ${cacheKey}`);
          return res.status(304).end();
        }

        return res.json(cached);
      }

      next();
    } catch (error) {
      logger.error(`Cache middleware error for ${cacheKey}`, error);
      next();
    }
  };
}

/**
 * Middleware to invalidate cache by tags
 */
export function invalidateCacheByTags(...tags: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const tag of tags) {
        await cacheService.invalidateByTag(tag);
        logger.debug(`Invalidated cache tag: ${tag}`);
      }
      next();
    } catch (error) {
      logger.error('Error invalidating cache tags', error);
      next();
    }
  };
}

/**
 * Middleware to invalidate cache by pattern
 */
export function invalidateCacheByPattern(pattern: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await cacheService.deleteByPattern(pattern);
      logger.debug(`Invalidated cache pattern: ${pattern} (${deleted} keys)`);
      next();
    } catch (error) {
      logger.error('Error invalidating cache pattern', error);
      next();
    }
  };
}

/**
 * Middleware to add cache headers to response
 */
export function setCacheHeaders(ttl: number = 3600) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set({
      'Cache-Control': `public, max-age=${ttl}`,
      'Last-Modified': new Date().toUTCString(),
    });
    next();
  };
}

/**
 * Middleware to prevent caching
 */
export function noCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
}
