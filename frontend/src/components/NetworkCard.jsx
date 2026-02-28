/**
 * NetworkCard — Tappable card for selecting a mobile network.
 * Shows the network's color and logo text. Highlights when selected.
 */

import React from 'react';

const NETWORKS = {
  MTN:     { color: '#FFCC00', bg: 'from-yellow-500/20 to-yellow-600/10', textColor: 'text-yellow-400', label: 'MTN' },
  Airtel:  { color: '#FF0000', bg: 'from-red-500/20 to-red-600/10',       textColor: 'text-red-400',    label: 'Airtel' },
  Glo:     { color: '#00A651', bg: 'from-green-500/20 to-green-600/10',   textColor: 'text-green-400',  label: 'Glo' },
  '9mobile': { color: '#006D35', bg: 'from-emerald-500/20 to-teal-600/10', textColor: 'text-emerald-400', label: '9mobile' },
};

export default function NetworkCard({ network, selected, onClick }) {
  const config = NETWORKS[network] || {};

  return (
    <button
      onClick={() => onClick(network)}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
        border-2 transition-all duration-200 active:scale-95 w-full
        bg-gradient-to-b ${config.bg}
        ${selected
          ? 'border-primary shadow-brand scale-105'
          : 'border-dark-border hover:border-gray-500'
        }
      `}
    >
      {/* Network initial / logo placeholder */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
        style={{ backgroundColor: config.color + '22', color: config.color }}
      >
        {network[0]}
      </div>

      <span className={`text-xs font-semibold ${config.textColor}`}>{config.label}</span>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
      )}
    </button>
  );
}
