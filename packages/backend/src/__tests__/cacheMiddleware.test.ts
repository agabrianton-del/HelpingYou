const mockCacheService = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(undefined),
  invalidateByTag: jest.fn().mockResolvedValue(undefined),
  deleteByPattern: jest.fn().mockResolvedValue(0),
};

jest.mock(
  '@/services/cache/cacheService',
  () => ({
    cacheService: mockCacheService,
  }),
  { virtual: true }
);

import { cacheMiddleware, setCacheHeaders } from '@/middleware/cacheMiddleware';

type MockRequest = {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string | undefined>;
};

function createRequest(overrides: Partial<MockRequest> = {}): MockRequest {
  return {
    method: 'GET',
    path: '/api/private',
    query: {},
    headers: {},
    ...overrides,
  };
}

function createResponse() {
  const res: Record<string, any> = {};

  res.statusCode = 200;
  res.set = jest.fn().mockReturnValue(res);
  res.vary = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.end = jest.fn();
  res.json = jest.fn().mockImplementation((data: unknown) => data);

  return res;
}

describe('cacheMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheService.get.mockResolvedValue(null);
    mockCacheService.set.mockResolvedValue(undefined);
  });

  it('bypasses cache access for authenticated requests', async () => {
    const req = createRequest({
      headers: {
        authorization: '******',
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await cacheMiddleware()(req as never, res as never, next);

    expect(mockCacheService.get).not.toHaveBeenCalled();
    expect(res.vary).toHaveBeenCalledWith('Authorization, Cookie');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns cached anonymous responses without downgrading the hit marker', async () => {
    mockCacheService.get.mockResolvedValue(false);

    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    const result = await cacheMiddleware()(req as never, res as never, next);

    const xCacheValues = res.set.mock.calls
      .map(([value]: [{ 'X-Cache'?: string }]) => value?.['X-Cache'])
      .filter(Boolean);

    expect(next).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(xCacheValues).toEqual(['HIT']);
    expect(res.vary).toHaveBeenCalledWith('Authorization, Cookie');
  });

  it('marks cache misses as private and stores the response body', async () => {
    const req = createRequest({
      query: {
        page: '1',
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await cacheMiddleware()(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);

    res.json({ id: '123' });

    const cacheHeaderCall = res.set.mock.calls.find(
      ([value]: [{ 'X-Cache'?: string }]) => value?.['X-Cache'] === 'MISS'
    );

    expect(cacheHeaderCall?.[0]).toEqual(
      expect.objectContaining({
        'Cache-Control': 'private, max-age=3600',
        'X-Cache': 'MISS',
      })
    );
    expect(res.vary).toHaveBeenCalledWith('Authorization, Cookie');
    expect(mockCacheService.set).toHaveBeenCalledTimes(1);
  });
});

describe('setCacheHeaders', () => {
  it('uses private cache headers for authenticated responses', () => {
    const req = createRequest({
      headers: {
        cookie: 'session=abc',
      },
    });
    const res = createResponse();
    const next = jest.fn();

    setCacheHeaders(60)(req as never, res as never, next);

    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Cache-Control': 'private, max-age=60',
      })
    );
    expect(res.vary).toHaveBeenCalledWith('Authorization, Cookie');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
