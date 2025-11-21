import EncryptedStorage from 'react-native-encrypted-storage';
import { SetState, GetState, StoreApi } from 'zustand';
import { setAuthToken as setApiAuthToken } from '../services/api';

// Token storage keys
const AUTH_TOKEN_KEY = '@quantumforge_auth_token';
const REFRESH_TOKEN_KEY = '@quantumforge_refresh_token';

export interface User {
  id: string;
  email: string;
  name: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface AuthSlice {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadTokensFromStorage: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  clearAuth: () => void;
}

export const createAuthSlice = (
  set: SetState<AuthSlice>,
  get: GetState<AuthSlice>,
  _store: StoreApi<AuthSlice>,
): AuthSlice => ({
  // Initial state
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Setters
  setUser: (user) => set({ user, isAuthenticated: !!user }, false, 'auth/setUser'),

  setToken: (token) => {
    set({ token }, false, 'auth/setToken');
    setApiAuthToken(token);
    if (token) {
      EncryptedStorage.setItem(AUTH_TOKEN_KEY, token).catch(() => {});
    } else {
      EncryptedStorage.removeItem(AUTH_TOKEN_KEY).catch(() => {});
    }
  },

  setRefreshToken: (refreshToken) => {
    set({ refreshToken }, false, 'auth/setRefreshToken');
    if (refreshToken) {
      EncryptedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken).catch(() => {});
    } else {
      EncryptedStorage.removeItem(REFRESH_TOKEN_KEY).catch(() => {});
    }
  },

  setLoading: (isLoading) => set({ isLoading }, false, 'auth/setLoading'),

  setError: (error) => set({ error }, false, 'auth/setError'),

  // Login action
  login: async (email, password) => {
    const { setToken, setRefreshToken, setUser, setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);

      // Fetch user profile
      const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  },

  // Register action
  register: async (name, email, password) => {
    const { setToken, setRefreshToken, setUser, setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store tokens
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);

      // Fetch user profile
      const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      setLoading(false);
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    const { clearAuth } = get();
    clearAuth();
  },

  // Load tokens from AsyncStorage on app start
  loadTokensFromStorage: async () => {
    const { setToken, setRefreshToken, setUser, setLoading } = get();

    setLoading(true);

    try {
      const [storedToken, storedRefreshToken] = await Promise.all([
        EncryptedStorage.getItem(AUTH_TOKEN_KEY),
        EncryptedStorage.getItem(REFRESH_TOKEN_KEY),
      ]);

      if (storedToken) {
        setToken(storedToken);

        // Verify token by fetching user profile
        try {
          const userResponse = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            if (storedRefreshToken) {
              setRefreshToken(storedRefreshToken);
            }
          } else {
            // Token invalid, try refresh
            if (storedRefreshToken) {
              setRefreshToken(storedRefreshToken);
              const refreshed = await get().refreshAuthToken();
              if (!refreshed) {
                // Refresh failed, clear auth
                get().clearAuth();
              }
            } else {
              // No refresh token, clear auth
              get().clearAuth();
            }
          }
        } catch (error) {
          // Network error, keep token but don't authenticate
          get().clearAuth();
        }
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  },

  // Refresh access token using refresh token
  refreshAuthToken: async () => {
    const { refreshToken, setToken, setUser, setRefreshToken } = get();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setToken(data.access_token);

      // Fetch updated user profile
      const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  // Clear all auth state
  clearAuth: () => {
    set(
      {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      },
      false,
      'auth/clearAuth',
    );
    setApiAuthToken(null);
    EncryptedStorage.removeItem(AUTH_TOKEN_KEY).catch(() => {});
    EncryptedStorage.removeItem(REFRESH_TOKEN_KEY).catch(() => {});
  },
});
