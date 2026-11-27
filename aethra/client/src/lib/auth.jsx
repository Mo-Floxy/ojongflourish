import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api('/auth/register', { method: 'POST', body: payload });
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch {
      /* local logout still succeeds */
    }
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((next) => setUser((current) => ({ ...current, ...next })), []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, updateUser, isAuthenticated: Boolean(user) }),
    [user, loading, login, register, logout, refresh, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
