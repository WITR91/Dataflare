/**
 * ProtectedRoute
 * Wraps routes that require authentication (or admin access).
 * Redirects unauthenticated users to /login.
 * Redirects non-admins away from admin routes.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
