import React from 'react';

export default function QuickAction({ glyph, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-tile)',
      padding: '10px 6px 8px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 6,
      fontSize: '10.5px', fontWeight: 700, color: '#1a1a1a',
      fontFamily: 'var(--font-body)', cursor: 'pointer',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: color, color: '#fff', fontWeight: 800, fontSize: 16,
        display: 'grid', placeItems: 'center',
        boxShadow: 'var(--shadow-quick-icon)',
      }}>{glyph}</div>
      {label}
    </button>
  );
}
