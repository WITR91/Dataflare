/**
 * Auth Context
 * Global authentication state shared across the entire app.
 * Provides: user, token, login(), logout(), updateUser()
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored session

  // ── Rehydrate session from localStorage on first load ────────────────────
  useEffect(() => {
    const token = localStorage.getItem('df_token');
    const stored = localStorage.getItem('df_user');

    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        // Fetch fresh profile in background to catch balance updates
        api.get('/auth/profile')
          .then(({ data }) => {
            setUser(data.user);
            localStorage.setItem('df_user', JSON.stringify(data.user));
          })
          .catch(() => {
            // Token invalid — clear everything
            localStorage.removeItem('df_token');
            localStorage.removeItem('df_user');
            setUser(null);
          });
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  // ── Save token + user after successful login/register ────────────────────
  const login = (token, userData) => {
    localStorage.setItem('df_token', token);
    localStorage.setItem('df_user', JSON.stringify(userData));
    setUser(userData);
  };

  // ── Clear everything on logout ───────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('df_token');
    localStorage.removeItem('df_user');
    setUser(null);
  };

  // ── Update user data (e.g. after wallet top-up) ──────────────────────────
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('df_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for cleaner imports
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
