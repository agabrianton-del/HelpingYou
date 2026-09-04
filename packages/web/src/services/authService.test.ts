import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './authService';

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Help',
  lastName: 'User',
  role: 'user',
} as const;

describe('authService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
  });

  it('uses cookie-backed sessions for login instead of localStorage tokens', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: mockUser }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

    vi.stubGlobal('fetch', fetchMock);

    await expect(authService.login('user@example.com', 'password')).resolves.toEqual(mockUser);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/auth/me',
      expect.objectContaining({
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })
    );
    expect(globalThis.localStorage.setItem).not.toHaveBeenCalled();
    expect(globalThis.localStorage.getItem).not.toHaveBeenCalled();
  });

  it('treats an unauthenticated current-user request as a missing session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    await expect(authService.getCurrentUser()).resolves.toBeNull();
  });

  it('omits authorization headers and tolerates missing logout endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));

    vi.stubGlobal('fetch', fetchMock);

    await expect(authService.logout()).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })
    );
    expect(globalThis.localStorage.removeItem).not.toHaveBeenCalled();
  });
});
