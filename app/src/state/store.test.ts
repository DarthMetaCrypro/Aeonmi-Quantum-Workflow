import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRootStore from './store';

// Note: Full auth integration tests are complex due to EncryptedStorage and API dependencies.
// These tests focus on basic state management. Full auth flow is tested in E2E tests.

describe('Auth Store (basic state management)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default auth state', () => {
    const { result } = renderHook(() => useRootStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets user and updates authentication status', () => {
    const { result } = renderHook(() => useRootStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      subscription_tier: 'free' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears user and authentication status', () => {
    const { result } = renderHook(() => useRootStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      subscription_tier: 'pro' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('manages loading state', () => {
    const { result } = renderHook(() => useRootStore());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('manages error state', () => {
    const { result } = renderHook(() => useRootStore());

    expect(result.current.error).toBeNull();

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('clears all auth state on clearAuth', () => {
    const { result } = renderHook(() => useRootStore());

    const mockUser = {
      id: '456',
      email: 'user@example.com',
      name: 'User',
      subscription_tier: 'enterprise' as const,
      created_at: new Date().toISOString(),
    };

    act(() => {
      result.current.setUser(mockUser);
      result.current.setError('Some error');
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearAuth();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
