/**
 * Dashboard — Home screen after login.
 * Shows wallet balance, quick-buy network shortcuts, and recent transactions.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdLogout, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const NET_COLORS = {
  MTN: '#FFCC00', Airtel: '#FF4444', Glo: '#00A651', '9mobile': '#00A24B',
};

// Compact transaction row shown on dashboard
function TxRow({ tx }) {
  const icons = {
    wallet_funding:    { emoji: '💳', label: 'Wallet Funding' },
    data_purchase:     { emoji: '📶', label: tx.dataBundle || 'Data Purchase' },
    referral_bonus:    { emoji: '🎁', label: 'Referral Bonus' },
    admin_adjustment:  { emoji: '⚙️', label: 'Admin Adjustment' },
  };

  const { emoji, label } = icons[tx.type] || { emoji: '💰', label: tx.type };

  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-border last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {tx.phoneNumber && (
            <p className="text-xs text-gray-500">{tx.network} → {tx.phoneNumber}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${tx.type === 'data_purchase' ? 'text-red-400' : 'text-green-400'}`}>
          {tx.type === 'data_purchase' ? '-' : '+'}₦{tx.amount.toLocaleString()}
        </p>
        <span className={`badge-${tx.status}`}>{tx.status}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    // Fetch recent transactions and fresh balance
    Promise.all([
      api.get('/wallet/transactions?limit=5'),
      api.get('/wallet/balance'),
    ])
      .then(([txRes, balRes]) => {
        setTransactions(txRes.data.transactions);
        updateUser({ walletBalance: balRes.data.walletBalance });
      })
      .catch(() => toast.error('Could not load dashboard data.'))
      .finally(() => setLoadingTx(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark pb-24 max-w-lg mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-10 pb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Welcome back 👋</p>
          <h1 className="font-black text-xl text-white">{user?.email?.split('@')[0]}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-red-400 transition-colors"
        >
          <MdLogout size={18} />
        </button>
      </div>

      {/* ── Wallet Balance Card ─────────────────────────────────────── */}
      <div className="mx-5 mb-6">
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-brand animate-glow">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />

          <p className="text-white/70 text-sm mb-1 relative z-10">Wallet Balance</p>
          <h2 className="text-4xl font-black text-white relative z-10">
            ₦{(user?.walletBalance ?? 0).toLocaleString()}
          </h2>

          <button
            onClick={() => navigate('/wallet')}
            className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors relative z-10 active:scale-95"
          >
            <MdAdd size={16} /> Fund Wallet
          </button>
        </div>
      </div>

      {/* ── Quick Buy — Network Shortcuts ───────────────────────────── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">Buy Data</h2>
          <button onClick={() => navigate('/buy-data')} className="text-xs text-primary-light flex items-center gap-1">
            See all <MdArrowForward size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {NETWORKS.map((net) => (
            <button
              key={net}
              onClick={() => navigate(`/buy-data?network=${net}`)}
              className="flex flex-col items-center gap-2 bg-dark-card border border-dark-border rounded-2xl p-3 active:scale-95 transition-all"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                style={{ backgroundColor: NET_COLORS[net] + '22', color: NET_COLORS[net] }}
              >
                {net[0]}
              </div>
              <span className="text-xs text-gray-400 font-medium">{net}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Admin shortcut ──────────────────────────────────────────── */}
      {user?.isAdmin && (
        <div className="mx-5 mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-secondary/10 border border-secondary/30 rounded-2xl px-4 py-3 flex items-center justify-between active:scale-95 transition-all"
          >
            <span className="text-secondary font-semibold text-sm">⚙️ Admin Panel</span>
            <MdArrowForward size={16} className="text-secondary" />
          </button>
        </div>
      )}

      {/* ── Recent Transactions ─────────────────────────────────────── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">Recent Activity</h2>
          <button onClick={() => navigate('/history')} className="text-xs text-primary-light flex items-center gap-1">
            View all <MdArrowForward size={14} />
          </button>
        </div>

        <div className="card">
          {loadingTx ? (
            <Loader size="sm" />
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">No transactions yet</p>
              <button onClick={() => navigate('/wallet')} className="mt-3 text-xs text-primary-light">
                Fund wallet to get started →
              </button>
            </div>
          ) : (
            transactions.map((tx) => <TxRow key={tx._id} tx={tx} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
