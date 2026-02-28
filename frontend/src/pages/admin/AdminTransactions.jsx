/**
 * Admin Transactions — Full transaction log with type and status filters.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/Loader';

const TYPE_LABELS = {
  wallet_funding:   { label: 'Funding',   emoji: '💳' },
  data_purchase:    { label: 'Data Buy',  emoji: '📶' },
  referral_bonus:   { label: 'Referral',  emoji: '🎁' },
  admin_adjustment: { label: 'Adjustment',emoji: '⚙️' },
};

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (typeFilter)   params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const { data } = await api.get(`/admin/transactions?${params}`);
      setTransactions(p === 1 ? data.transactions : [...transactions, ...data.transactions]);
      setTotalPages(data.pages);
      setPage(p);
    } catch {
      toast.error('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(1); }, [typeFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-dark pb-10 max-w-lg mx-auto">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400">
            <MdArrowBack size={20} />
          </button>
          <h1 className="font-black text-xl text-white">Transactions</h1>
        </div>
        <button onClick={() => fetch(1)} className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="px-5 mb-4 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[['', 'All Types'], ['wallet_funding', 'Funding'], ['data_purchase', 'Data'], ['referral_bonus', 'Referral']].map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${typeFilter === v ? 'bg-primary text-white' : 'bg-dark-card border border-dark-border text-gray-400'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[['', 'All Status'], ['success', 'Success'], ['pending', 'Pending'], ['failed', 'Failed']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === v ? 'bg-secondary text-white' : 'bg-dark-card border border-dark-border text-gray-400'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-5 space-y-3">
        {loading && page === 1 ? <Loader /> : (
          <>
            {transactions.map((tx) => {
              const { label, emoji } = TYPE_LABELS[tx.type] || { label: tx.type, emoji: '💰' };
              return (
                <div key={tx._id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{emoji}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{tx.user?.email || tx.user?.phone}</p>
                        {tx.phoneNumber && <p className="text-xs text-gray-600">{tx.network} → {tx.phoneNumber}</p>}
                        <p className="text-xs text-gray-600 mt-0.5">
                          {new Date(tx.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-sm ${tx.type === 'data_purchase' ? 'text-red-400' : 'text-green-400'}`}>
                        ₦{tx.amount.toLocaleString()}
                      </p>
                      <span className={`badge-${tx.status}`}>{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {transactions.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-500 text-sm">No transactions found</p>
              </div>
            )}

            {page < totalPages && (
              <button onClick={() => fetch(page + 1)} disabled={loading} className="btn-secondary w-full mt-2">
                {loading ? 'Loading…' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
