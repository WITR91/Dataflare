/**
 * BottomNav — Fixed bottom navigation bar (like a real mobile app).
 * Shows 5 tabs: Dashboard, Buy Data, Wallet, History, Referral.
 * Active tab is highlighted with brand gradient.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdWifi,
  MdAccountBalanceWallet,
  MdHistory,
  MdShare,
} from 'react-icons/md';

const tabs = [
  { to: '/dashboard', icon: MdDashboard,            label: 'Home' },
  { to: '/buy-data',  icon: MdWifi,                 label: 'Buy Data' },
  { to: '/wallet',    icon: MdAccountBalanceWallet,  label: 'Wallet' },
  { to: '/history',   icon: MdHistory,               label: 'History' },
  { to: '/referral',  icon: MdShare,                 label: 'Refer' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-light scale-105'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-primary/20' : ''
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
