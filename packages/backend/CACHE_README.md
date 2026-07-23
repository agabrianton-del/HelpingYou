# API Cache Implementation

## 📚 Overview

Complete caching solution for Node.js/Express APIs with Redis backend.

## ✨ Features

- ✅ **Redis Integration** - High-performance in-memory cache
- ✅ **HTTP Caching** - ETag, Cache-Control, Last-Modified headers
- ✅ **Cache Invalidation** - By tags, patterns, or TTL
- ✅ **Decorators** - TypeScript decorators for seamless integration
- ✅ **Middleware** - Express middleware for automatic caching
- ✅ **Statistics** - Track hit rates and performance metrics
- ✅ **Health Monitoring** - Built-in Redis health checks
- ✅ **Management Routes** - Debug and control cache via API

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd packages/backend
npm install redis
```

### 2. Start Redis

```bash
# Using Docker Compose
docker-compose -f docker-compose.redis.yml up -d

# Or run Redis locally
redis-server
```

### 3. Configure Environment

```bash
cp .env.example .env
# Update REDIS_URL if needed
```

### 4. Initialize in Your Server

```typescript
import { setupServer } from '@/config/serverSetup';

const app = express();
await setupServer(app);
```

## 📖 Usage Examples

### HTTP Middleware (Simplest)

```typescript
import { cacheMiddleware, invalidateCacheByTags } from '@/middleware/cacheMiddleware';

// GET endpoint with cache
router.get(
  '/users/:id',
  cacheMiddleware({ ttl: 1800, tags: ['users'] }),
  async (req, res) => {
    // Your handler
  }
);

// POST endpoint with cache invalidation
router.post(
  '/users',
  invalidateCacheByTags('users'),
  async (req, res) => {
    // Your handler
  }
);
```

### CacheService Direct

```typescript
import { cacheService } from '@/services/cache/cacheService';

// Get or set
const user = await cacheService.getOrSet(
  'user:123',
  () => fetchUserFromDB('123'),
  { ttl: 3600, tags: ['users'] }
);

// Manual set
await cacheService.set('key', data, { ttl: 1800, tags: ['users'] });

// Get
const data = await cacheService.get('key');

// Delete
await cacheService.delete('key');

// Invalidate by tag
await cacheService.invalidateByTag('users');
```

### Base Repository

```typescript
class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  // Implement abstract methods...
}

// Automatic caching
const user = await repo.findById('123');
const all = await repo.findAll();
await repo.create(userData); // Auto-invalidates cache
await repo.update('123', data); // Auto-invalidates cache
```

### Decorators

```typescript
class UserService {
  @Cache({ ttl: 3600, tags: ['users'] })
  async getUser(id: string) {
    // Auto-cached
  }

  @CacheInvalidate({ tags: ['users'] })
  async createUser(data: User) {
    // Auto-invalidates cache
  }
}
```

## 🛠️ Management API

### View Cache Statistics

```bash
curl http://localhost:3000/cache/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "healthy": true,
    "stats": [
      {
        "key": "user:123",
        "hits": 45,
        "misses": 3,
        "hitRate": 0.9375,
        "totalRequests": 48
      }
    ]
  }
}
```

### Check Cache Health

```bash
curl http://localhost:3000/cache/health
```

### Clear All Cache

```bash
curl -X DELETE http://localhost:3000/cache/clear
```

### Invalidate by Tag

```bash
curl -X DELETE http://localhost:3000/cache/invalidate-tag/users
```

### Invalidate by Pattern

```bash
curl -X DELETE http://localhost:3000/cache/invalidate-pattern/user:*
```

## 📁 Project Structure

```
packages/backend/src/
├── services/
│   └── cache/
│       └── cacheService.ts          # Core cache service
├── middleware/
│   └── cacheMiddleware.ts           # Express middleware
├── decorators/
│   └── cacheDecorator.ts            # TypeScript decorators
├── repositories/
│   └── baseRepository.ts            # Base repo with cache
├── routes/
│   └── cacheRoutes.ts               # Management routes
├── config/
│   └── serverSetup.ts               # Server initialization
├── utils/
│   └── logger.ts                    # Logging utility
├── examples/
│   └── userService.example.ts       # Usage examples
└── __tests__/
    └── cache.test.ts                # Tests

docker-compose.redis.yml             # Redis Docker setup
CACHE_GUIDE.md                        # Detailed guide
```

## 🎯 Best Practices

### ✅ DO

- Use appropriate TTLs (1-3600 seconds)
- Tag related cache entries
- Invalidate on mutations (CREATE, UPDATE, DELETE)
- Monitor hit rates
- Use Cache-Aside pattern
- Implement cache warming for hot data

### ❌ DON'T

- Cache sensitive data without encryption
- Use very long TTLs (>24 hours)
- Cache errors
- Forget to invalidate on updates
- Cache everything indiscriminately

## 📊 Performance Tips

1. **Right TTL**: Balance freshness vs cache efficiency
   - Static data: 3600s
   - Dynamic data: 300-900s
   - Real-time: 0s (no cache)

2. **Specific cache keys**: Avoid wildcard patterns
   - Good: `user:123`
   - Bad: `user:*` (every key)

3. **Tag strategy**: Group related entries
   ```typescript
   { ttl: 3600, tags: ['users', 'premium', 'active'] }
   ```

4. **Monitor metrics**: Check cache dashboard
   - Low hit rate? Increase TTL
   - High memory? Decrease TTL

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Redis connection fails | Check Redis is running: `redis-cli ping` |
| Low hit rate | Increase TTL, review cache keys |
| Memory usage high | Reduce TTL or number of keys |
| Stale data | Review invalidation logic |
| Cache not clearing | Use tags for bulk invalidation |

## 📚 Full Documentation

See [CACHE_GUIDE.md](./CACHE_GUIDE.md) for comprehensive documentation.

## 🧪 Testing

```bash
npm run test -- cache.test.ts
```

## 📦 Environment Variables

```env
# Redis Connection
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache Settings
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=3600
DEBUG=false
```

## 🔗 Related Files

- [CacheService](./src/services/cache/cacheService.ts) - Main cache service
- [Middleware](./src/middleware/cacheMiddleware.ts) - Express integration
- [Base Repository](./src/repositories/baseRepository.ts) - ORM integration
- [Examples](./src/examples/userService.example.ts) - Usage examples
- [Routes](./src/routes/cacheRoutes.ts) - Management endpoints

## 📞 Support

For issues or questions, refer to the detailed [CACHE_GUIDE.md](./CACHE_GUIDE.md) or check the examples in `src/examples/`.

---

**Last Updated**: July 2026  
**Status**: ✅ Production Ready
