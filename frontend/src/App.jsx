/**
 * App.jsx — Root Router
 * Defines all routes. Protected routes redirect to /login if not authenticated.
 * Admin routes redirect non-admins to /dashboard.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import BuyData       from './pages/BuyData';
import Wallet        from './pages/Wallet';
import History       from './pages/History';
import Referral      from './pages/Referral';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminBundles     from './pages/admin/AdminBundles';
import AdminTransactions from './pages/admin/AdminTransactions';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Loader         from './components/Loader';

export default function App() {
  const { user, loading } = useAuth();

  // Show spinner while checking stored session
  if (loading) return <Loader fullScreen />;

  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* ── Protected (any logged-in user) ─────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buy-data"  element={<BuyData />} />
        <Route path="/wallet"    element={<Wallet />} />
        <Route path="/history"   element={<History />} />
        <Route path="/referral"  element={<Referral />} />
      </Route>

      {/* ── Admin only ──────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/users"        element={<AdminUsers />} />
        <Route path="/admin/bundles"      element={<AdminBundles />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
      </Route>

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
    </Routes>
  );
}
