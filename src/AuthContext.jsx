import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import { clearSession, getExpiry, touchSession } from './session.js';

const EXPIRED_NOTICE = 'You were logged out after 5 minutes of inactivity. Please log in again.';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];
const ACTIVITY_THROTTLE_MS = 5 * 1000;
const TOKEN_REFRESH_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 1000;

const AuthContext = createContext(null);

function readUser() {
  try {
    const expiresAt = getExpiry();
    if (!expiresAt || expiresAt <= Date.now()) {
      clearSession();
      return null;
    }
    return JSON.parse(localStorage.getItem('user'));
  } catch (err) {
    return null;
  }
}

function readNotice() {
  const notice = sessionStorage.getItem('authNotice');
  sessionStorage.removeItem('authNotice');
  return notice || '';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [notice, setNotice] = useState(readNotice);
  const lastRefresh = useRef(Date.now());

  const login = useCallback((token, nextUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    touchSession();
    lastRefresh.current = Date.now();
    setNotice('');
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Idle timeout: every user interaction pushes the deadline 5 minutes ahead,
  // and the server token is renewed (at most once a minute) so it stays valid too.
  useEffect(() => {
    if (!user) return undefined;
    let lastActivity = 0;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity < ACTIVITY_THROTTLE_MS) return;
      lastActivity = now;
      if (getExpiry() <= now) return; // already expired; the checker will log out
      touchSession();
      if (now - lastRefresh.current >= TOKEN_REFRESH_MS) {
        lastRefresh.current = now;
        api('/auth/refresh', { method: 'POST' })
          .then((data) => {
            if (localStorage.getItem('token')) localStorage.setItem('token', data.token);
          })
          .catch(() => {});
      }
    };

    const checker = setInterval(() => {
      if (getExpiry() <= Date.now()) {
        clearSession();
        setNotice(EXPIRED_NOTICE);
        setUser(null);
      }
    }, CHECK_INTERVAL_MS);

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    return () => {
      clearInterval(checker);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [user]);

  const value = useMemo(() => ({ user, notice, login, logout }), [user, notice, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
