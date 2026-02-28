/**
 * Transaction History Page
 * Full list of all user transactions with filters by type and status.
 */

import React, { useState, useEffect } from 'react';
import { MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';

const TYPE_LABELS = {
  wallet_funding:   { label: 'Wallet Funding', emoji: '💳' },
  data_purchase:    { label: 'Data Purchase',  emoji: '📶' },
  referral_bonus:   { label: 'Referral Bonus', emoji: '🎁' },
  admin_adjustment: { label: 'Adjustment',     emoji: '⚙️' },
};

function TransactionCard({ tx }) {
  const { label, emoji } = TYPE_LABELS[tx.type] || { label: tx.type, emoji: '💰' };
  const isDebit = tx.type === 'data_purchase';

  return (
    <div className="card mb-3 flex items-start gap-4">
      {/* Icon */}
      <div className="w-10 h-10 bg-dark-light rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        {emoji}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-white text-sm">{label}</p>
            {tx.dataBundle && (
              <p className="text-xs text-gray-400">{tx.network} · {tx.dataBundle}</p>
            )}
            {tx.phoneNumber && (
              <p className="text-xs text-gray-500">→ {tx.phoneNumber}</p>
            )}
            {tx.description && !tx.dataBundle && (
              <p className="text-xs text-gray-500 truncate">{tx.description}</p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className={`font-black text-sm ${isDebit ? 'text-red-400' : 'text-green-400'}`}>
              {isDebit ? '-' : '+'}₦{tx.amount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-600">
            {new Date(tx.createdAt).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <span className={`badge-${tx.status}`}>{tx.status}</span>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all | data_purchase | wallet_funding

  const fetchTx = async (p = 1, f = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      const { data } = await api.get(`/wallet/transactions?${params}`);

      // Client-side filter (type filter)
      const filtered = f === 'all'
        ? data.transactions
        : data.transactions.filter((t) => t.type === f);

      setTransactions(p === 1 ? filtered : [...transactions, ...filtered]);
      setTotalPages(data.pages);
      setPage(p);
    } catch {
      toast.error('Could not load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTx(1, filter); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const FILTERS = [
    { key: 'all',           label: 'All' },
    { key: 'data_purchase', label: 'Data' },
    { key: 'wallet_funding',label: 'Funding' },
    { key: 'referral_bonus',label: 'Referral' },
  ];

  return (
    <div className="min-h-screen bg-dark pb-24 max-w-lg mx-auto">

      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl text-white">History</h1>
          <p className="text-gray-400 text-sm mt-0.5">All your transactions</p>
        </div>
        <button onClick={() => fetchTx(1)} className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-primary text-white'
                  : 'bg-dark-card border border-dark-border text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-5">
        {loading && page === 1 ? (
          <Loader />
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            {transactions.map((tx) => <TransactionCard key={tx._id} tx={tx} />)}

            {page < totalPages && (
              <button
                onClick={() => fetchTx(page + 1)}
                disabled={loading}
                className="btn-secondary w-full mt-2"
              >
                {loading ? 'Loading…' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
