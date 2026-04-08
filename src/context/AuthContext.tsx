import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { clearLocalData, syncFromRemote } from '@/lib/sync';

const TOKEN_KEY = 'ezgym:token';
const USER_KEY = 'ezgym:user';

export interface AuthUser {
  userId: string;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error?: string }>;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  deleteAccount: (password: string) => Promise<{ error?: string }>;
  isOnline: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function getApiBase(): string {
  return import.meta.env.VITE_API_URL || '';
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verify session on load
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${getApiBase()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ user: u }) => {
        setUser(u);
        storeAuth(token, u);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    try {
      await clearLocalData();
      const res = await fetch(`${getApiBase()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Registration failed' };
      storeAuth(data.token, data.user);
      setUser(data.user);
      syncFromRemote().catch(() => {});
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      await clearLocalData();
      const res = await fetch(`${getApiBase()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed' };
      storeAuth(data.token, data.user);
      setUser(data.user);
      syncFromRemote().catch(() => {});
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    clearAuth();
    setUser(null);
    await clearLocalData();
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to change password' };
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to delete account' };
      clearAuth();
      setUser(null);
      await clearLocalData();
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        changePassword,
        deleteAccount,
        isOnline,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
