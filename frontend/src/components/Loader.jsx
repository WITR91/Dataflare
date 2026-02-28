/**
 * Loader — animated spinner used for loading states throughout the app.
 * fullScreen=true fills the entire viewport (used on initial auth check).
 */

import React from 'react';

export default function Loader({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div
      className={`${sizes[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark flex flex-col items-center justify-center gap-4">
        {/* Mini logo */}
        <div className="text-3xl font-black bg-gradient-brand bg-clip-text text-transparent">
          DataFlare
        </div>
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-6">{spinner}</div>;
}
