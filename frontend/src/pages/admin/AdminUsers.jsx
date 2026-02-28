/**
 * Admin Users — Search users, view balances, credit/debit wallets, toggle status.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSearch, MdAdd, MdBlock } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/Loader';

function AdjustModal({ user, onClose, onDone }) {
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount.');
    setLoading(true);
    try {
      const { data } = await api.patch(`/admin/users/${user._id}/wallet`, {
        amount: Number(amount), type, reason,
      });
      toast.success(data.message);
      onDone(user._id, data.newBalance);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={onClose}>
      <div className="bg-dark-card border-t border-dark-border w-full max-w-lg mx-auto rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-black text-white text-lg mb-1">Adjust Wallet</h3>
        <p className="text-xs text-gray-400 mb-4">{user.email} · Current: ₦{user.walletBalance?.toLocaleString()}</p>

        <div className="flex gap-2 mb-4">
          {['credit', 'debit'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${
                type === t
                  ? t === 'credit' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-dark-light border border-dark-border text-gray-400'
              }`}
            >
              {t === 'credit' ? '+ Credit' : '− Debit'}
            </button>
          ))}
        </div>

        <input type="number" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input mb-3" />
        <input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="input mb-4" />

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?limit=50&search=${q}`);
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (userId, current) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/status`);
      setUsers((u) => u.map((x) => x._id === userId ? { ...x, isActive: data.isActive } : x));
      toast.success(data.message);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleBalanceUpdate = (userId, newBalance) => {
    setUsers((u) => u.map((x) => x._id === userId ? { ...x, walletBalance: newBalance } : x));
  };

  return (
    <div className="min-h-screen bg-dark pb-10 max-w-lg mx-auto">
      <div className="px-5 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400">
          <MdArrowBack size={20} />
        </button>
        <h1 className="font-black text-xl text-white">Users ({users.length})</h1>
      </div>

      {/* Search */}
      <div className="px-5 mb-4 relative">
        <MdSearch size={18} className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search email or phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); fetchUsers(e.target.value); }}
          className="input pl-10"
        />
      </div>

      <div className="px-5 space-y-3">
        {loading ? <Loader /> : users.map((u) => (
          <div key={u._id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-white text-sm">{u.email}</p>
                <p className="text-xs text-gray-500">{u.phone}</p>
              </div>
              <div className="flex items-center gap-1">
                {u.isAdmin && <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Admin</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {u.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-black text-primary-light">₦{u.walletBalance?.toLocaleString()}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="flex items-center gap-1 text-xs bg-primary/10 text-primary-light border border-primary/30 px-3 py-1.5 rounded-xl"
                >
                  <MdAdd size={14} /> Adjust
                </button>
                <button
                  onClick={() => handleToggleStatus(u._id, u.isActive)}
                  className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl"
                >
                  <MdBlock size={14} /> {u.isActive ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <AdjustModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDone={handleBalanceUpdate}
        />
      )}
    </div>
  );
}
