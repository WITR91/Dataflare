/**
 * Wallet Page
 * Fund wallet via Paystack, view balance.
 * On return from Paystack redirect, verifies the payment automatically.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MdAdd, MdAccountBalanceWallet } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function Wallet() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ── Auto-verify payment on return from Paystack ─────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setVerifying(true);
      api.get(`/wallet/verify/${ref}`)
        .then(({ data }) => {
          toast.success(data.message);
          updateUser({ walletBalance: data.walletBalance });
        })
        .catch((err) => toast.error(err.response?.data?.message || 'Verification failed.'))
        .finally(() => {
          setVerifying(false);
          // Remove ?ref= from URL so refreshing doesn't re-verify
          setSearchParams({});
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFund = async () => {
    const num = Number(amount);
    if (!num || num < 100) return toast.error('Minimum amount is ₦100.');

    setLoading(true);
    try {
      const { data } = await api.post('/wallet/fund', { amount: num });
      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initialize payment.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark pb-24 max-w-lg mx-auto">

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <h1 className="font-black text-2xl text-white">Wallet</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your DataFlare balance</p>
      </div>

      {/* Balance Card */}
      <div className="mx-5 mb-6">
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-gold">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />

          <div className="flex items-center gap-2 mb-1 relative z-10">
            <MdAccountBalanceWallet size={16} className="text-white/70" />
            <p className="text-white/70 text-sm">Available Balance</p>
          </div>
          <h2 className="text-4xl font-black text-white relative z-10">
            ₦{(user?.walletBalance ?? 0).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Verifying overlay */}
      {verifying && (
        <div className="mx-5 mb-4 bg-primary/10 border border-primary/30 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-primary-light">Verifying your payment…</p>
        </div>
      )}

      {/* Fund Wallet Section */}
      <div className="px-5">
        <div className="card">
          <h2 className="font-bold text-white mb-4">Add Money</h2>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                  amount === String(a)
                    ? 'bg-primary text-white'
                    : 'bg-dark-light text-gray-400 border border-dark-border'
                }`}
              >
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input pl-8"
              min={100}
            />
          </div>

          <button
            onClick={handleFund}
            disabled={loading || !amount}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <MdAdd size={18} />
            {loading ? 'Redirecting to Paystack…' : `Fund ₦${Number(amount || 0).toLocaleString()}`}
          </button>

          <p className="text-xs text-gray-600 text-center mt-3">
            Secured by Paystack · Card, Transfer & USSD accepted
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
