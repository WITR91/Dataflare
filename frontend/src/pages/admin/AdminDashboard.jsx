/**
 * Admin Dashboard — Overview stats and navigation to other admin sections.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPeople, MdReceipt, MdSignalCellularAlt, MdTrendingUp, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/Loader';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

const MENU = [
  { to: '/admin/users',        label: 'Users',        sub: 'Manage accounts & balances', icon: MdPeople },
  { to: '/admin/bundles',      label: 'Data Bundles', sub: 'Set prices & manage plans',  icon: MdSignalCellularAlt },
  { to: '/admin/transactions', label: 'Transactions', sub: 'View all purchases',          icon: MdReceipt },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Could not load stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark pb-10 max-w-lg mx-auto">

      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium">Admin</span>
            <h1 className="font-black text-2xl text-white mt-1">Control Panel</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-xs text-gray-400 hover:text-white">
            ← Back to app
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* Stats grid */}
          <div className="px-5 mb-6 grid grid-cols-2 gap-3">
            <StatCard icon={MdPeople}           label="Total Users"         value={stats?.totalUsers ?? 0}           color="bg-primary" />
            <StatCard icon={MdTrendingUp}        label="Total Revenue"       value={`₦${(stats?.totalRevenue ?? 0).toLocaleString()}`} color="bg-secondary" />
            <StatCard icon={MdReceipt}           label="All Transactions"    value={stats?.totalTransactions ?? 0}    color="bg-accent" />
            <StatCard icon={MdSignalCellularAlt} label="Successful Purchases" value={stats?.successfulPurchases ?? 0} color="bg-green-600" />
          </div>

          {/* Nav menu */}
          <div className="px-5 space-y-3">
            {MENU.map(({ to, label, sub, icon: Icon }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="card w-full flex items-center justify-between group hover:border-primary/50 transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-primary-light" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                </div>
                <MdArrowForward size={18} className="text-gray-600 group-hover:text-primary-light transition-colors" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
