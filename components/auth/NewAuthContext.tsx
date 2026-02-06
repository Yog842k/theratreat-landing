"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_USER_KEY = 'user';
const STORAGE_TOKEN_KEY = 'token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }, []);

  const parseJwt = useCallback((jwtToken: string) => {
    try {
      const [, payload] = jwtToken.split('.');
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const isTokenExpired = useCallback((jwtToken: string) => {
    const payload = parseJwt(jwtToken);
    if (!payload || typeof payload.exp !== 'number') return false;
    return Date.now() >= payload.exp * 1000;
  }, [parseJwt]);

  const loadFromStorage = useCallback(() => {
    try {
      // Prefer new keys, but support legacy keys used in older flows
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY) || localStorage.getItem('authToken');
      const storedUser = localStorage.getItem(STORAGE_USER_KEY) || localStorage.getItem('user');
      if (storedToken && storedUser) {
        if (isTokenExpired(storedToken)) {
          clearStoredAuth();
          setToken(null);
          setUser(null);
          return;
        }
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    } catch {
      setToken(null);
      setUser(null);
    }
  }, [clearStoredAuth, isTokenExpired]);

  useEffect(() => {
    loadFromStorage();
    setIsLoading(false);
    // Listen for cross-tab auth changes
    const handler = (e: StorageEvent) => {
      if ([STORAGE_TOKEN_KEY, STORAGE_USER_KEY].includes(e.key || '')) {
        loadFromStorage();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [loadFromStorage]);

  const login = (newToken: string, newUser: AuthUser) => {
    // Write both new and legacy keys to keep all modules in sync
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  const refresh = () => loadFromStorage();

  useEffect(() => {
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload || typeof payload.exp !== 'number') return;
    const remainingMs = payload.exp * 1000 - Date.now();
    if (remainingMs <= 0) {
      logout();
      return;
    }
    const timer = window.setTimeout(() => {
      logout();
    }, remainingMs);
    return () => window.clearTimeout(timer);
  }, [token, parseJwt, logout]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user && !isTokenExpired(token),
    isLoading,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
