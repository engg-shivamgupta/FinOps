import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi.js';
import { dashboardApi } from '../api/dashboardApi.js';
import { onSessionEnded } from '../api/client.js';
import { tokenStore } from '../api/tokenStore.js';
import { usersApi } from '../api/usersApi.js';
import { parseApiError } from '../utils/errors.js';

export const AuthContext = createContext(null);

const initialState = () => {
  const stored = tokenStore.read();
  return {
    status: stored ? 'loading' : 'unauthenticated', // loading | authenticated | unauthenticated | error
    token: stored?.token ?? null,
    role: stored?.role ?? null,
    permissions: stored?.interface ?? {},
    user: null,
    notice: null, // 'expired' | 'inactive' | null
    error: null,
  };
};

const signedOut = (notice = null) => ({
  status: 'unauthenticated', token: null, role: null, permissions: {}, user: null, notice, error: null,
});

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  const endSession = useCallback((notice = null) => {
    tokenStore.clear();
    setState(signedOut(notice));
  }, []);

  // Restore a stored session only after /api/users/me confirms the token is valid.
  const restoreSession = useCallback(async () => {
    const stored = tokenStore.read();
    if (!stored) {
      setState(signedOut());
      return;
    }
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const user = await usersApi.me();
      let { role, interface: permissions } = stored;
      if (user.role !== role) {
        // Role changed since login: pull the registrar's current map (public endpoint).
        try {
          const map = await dashboardApi.roles();
          if (map?.[user.role]) {
            role = user.role;
            permissions = map[user.role];
            tokenStore.write({ ...stored, role, interface: permissions });
          }
        } catch { /* keep stored permissions; the backend still enforces */ }
      }
      setState({ status: 'authenticated', token: stored.token, role, permissions, user, notice: null, error: null });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 401 || parsed.status === 403) {
        endSession(parsed.status === 403 ? 'inactive' : 'expired');
      } else {
        // Network/server trouble: keep the token and let the user retry rather than logging out.
        setState((s) => ({ ...s, status: 'error', error: parsed }));
      }
    }
  }, [endSession]);

  useEffect(() => { restoreSession(); }, [restoreSession]);
  useEffect(() => { onSessionEnded((reason) => endSession(reason)); return () => onSessionEnded(null); }, [endSession]);

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    tokenStore.write({ token: data.access_token, role: data.role, interface: data.interface });
    try {
      const user = await usersApi.me();
      setState({ status: 'authenticated', token: data.access_token, role: data.role, permissions: data.interface, user, notice: null, error: null });
    } catch (err) {
      tokenStore.clear();
      setState(signedOut());
      throw err;
    }
  }, []);

  const logout = useCallback(() => endSession(null), [endSession]);

  const refreshUser = useCallback(async () => {
    const user = await usersApi.me();
    setState((s) => ({ ...s, user }));
    return user;
  }, []);

  const clearNotice = useCallback(() => setState((s) => (s.notice ? { ...s, notice: null } : s)), []);

  const value = useMemo(
    () => ({ ...state, isAuthenticated: state.status === 'authenticated', login, logout, refreshUser, retrySession: restoreSession, clearNotice }),
    [state, login, logout, refreshUser, restoreSession, clearNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
