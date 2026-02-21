import React from 'react';

export const Spinner: React.FC<{ size?: string }> = ({ size }) => {
  const dim = size === 'h-4 w-4' ? 16 : size === 'h-8 w-8' ? 32 : 24;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <svg
        className="spinner-rotate"
        style={{ width: dim, height: dim }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
        <path style={{ opacity: 0.9 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
};
