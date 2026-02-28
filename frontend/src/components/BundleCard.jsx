/**
 * BundleCard — Displays a single data bundle option.
 * Shows size, validity, and price. Highlights when selected.
 */

import React from 'react';
import { MdSignalCellularAlt } from 'react-icons/md';

export default function BundleCard({ bundle, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(bundle)}
      className={`
        w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95
        ${selected
          ? 'border-primary bg-primary/10 shadow-brand'
          : 'border-dark-border bg-dark-card hover:border-gray-500'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${selected ? 'bg-primary/20' : 'bg-dark-light'}`}>
            <MdSignalCellularAlt
              size={18}
              className={selected ? 'text-primary-light' : 'text-gray-400'}
            />
          </div>
          <div>
            <p className="font-bold text-white">{bundle.name}</p>
            <p className="text-xs text-gray-400">{bundle.validity}</p>
          </div>
        </div>

        {/* Price badge */}
        <div
          className={`
            px-3 py-1.5 rounded-xl font-bold text-sm
            ${selected ? 'bg-primary text-white' : 'bg-dark-light text-secondary'}
          `}
        >
          ₦{bundle.price.toLocaleString()}
        </div>
      </div>
    </button>
  );
}
