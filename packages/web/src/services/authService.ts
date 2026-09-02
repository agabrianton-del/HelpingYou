import { User, RegisterData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { data?: T };

  if (payload.data === undefined) {
    throw new Error('Malformed API response');
  }

  return payload.data;
}

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authenticated session was not established');
    }

    return user;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authenticated session was not established');
    }

    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return parseJsonResponse<User>(response);
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok && response.status !== 404 && response.status !== 405) {
      throw new Error('Logout failed');
    }
  }
}

export const authService = new AuthService();
