import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken, setUnauthorizedHandler } from '../api/client';

const TOKEN_KEY = 'campusconnect.token';

const AuthContext = createContext(null);

export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload));
    if (claims.exp && claims.exp * 1000 <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
};

// Week 7 persistence: "Remember me" keeps the token in localStorage, otherwise sessionStorage,
// so a refresh or a typed URL does not log the user out.
const tokenStores = () => [window.localStorage, window.sessionStorage];

const clearStoredToken = () => {
  try {
    tokenStores().forEach((store) => store.removeItem(TOKEN_KEY));
  } catch {
    // Storage unavailable; nothing to clear.
  }
};

const storeToken = (token, remember) => {
  clearStoredToken();
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable; the login lasts until the page is reloaded.
  }
};

const readStoredToken = () => {
  try {
    const stored = tokenStores().map((store) => store.getItem(TOKEN_KEY)).find(Boolean);
    if (stored && decodeToken(stored)) return stored;
  } catch {
    return null;
  }
  clearStoredToken();
  return null;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Restore the saved session and hand it to the API client before any page requests data.
    const stored = readStoredToken();
    setAuthToken(stored);
    return stored;
  });

  const claims = useMemo(() => (token ? decodeToken(token) : null), [token]);
  const user = useMemo(
    () => (claims ? { userId: claims.userId, tenantId: claims.tenantId, role: claims.role } : null),
    [claims]
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setAuthToken(null);
    setToken(null);
  }, []);

  const login = useCallback(async ({ email, password, tenantId, remember = false }) => {
    const response = await api.post('/api/auth/login', { email, password, tenantId });
    const nextToken = response.data?.token;
    const nextClaims = nextToken ? decodeToken(nextToken) : null;
    if (!nextClaims) throw new Error('The server did not return a valid token.');

    storeToken(nextToken, remember);
    // Set on the client before the state update so the next page's requests carry it.
    setAuthToken(nextToken);
    setToken(nextToken);
    return { userId: nextClaims.userId, tenantId: nextClaims.tenantId, role: nextClaims.role };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Log out when the token expires.
  useEffect(() => {
    if (!claims?.exp) return undefined;
    const timer = setTimeout(logout, claims.exp * 1000 - Date.now());
    return () => clearTimeout(timer);
  }, [claims, logout]);

  const value = useMemo(
    () => ({ token: user ? token : null, user, isAuthenticated: Boolean(user), login, logout }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
};
