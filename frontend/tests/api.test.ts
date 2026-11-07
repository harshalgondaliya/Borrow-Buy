import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, ApiError } from '../src/services/api';

describe('Frontend API Client Service Tests', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};
    global.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: (i: number) => Object.keys(mockStorage)[i] || null,
      length: 0,
    } as Storage;
  });

  it('should instantiate ApiError with proper status and error details', () => {
    const error = new ApiError('Validation Failed', 400, [{ field: 'email', message: 'Required' }]);
    expect(error.message).toBe('Validation Failed');
    expect(error.statusCode).toBe(400);
    expect(error.errors).toHaveLength(1);
    expect(error.name).toBe('ApiError');
  });

  it('should perform GET request and parse successful JSON response', async () => {
    const mockData = { success: true, data: [{ id: '1', name: 'Camera' }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiRequest('/products');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/products',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should include Authorization Bearer header when token exists in localStorage', async () => {
    localStorage.setItem('borrowbuy_token', 'test-jwt-token-12345');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiRequest('/auth/me');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token-12345',
        }),
      })
    );
  });

  it('should throw ApiError with backend message on HTTP 400/401/500 errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials or expired session' }),
    });

    await expect(apiRequest('/auth/login', { method: 'POST' })).rejects.toThrowError(
      'Invalid credentials or expired session'
    );
  });
});
