import React from 'react';

export default function FilterChip({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      background: active ? 'var(--ink)' : '#fff',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
      borderRadius: 'var(--r-pill)',
      padding: '7px 12px',
      fontSize: '11.5px', fontWeight: 700,
      color: active ? '#fff' : 'var(--ink)',
      fontFamily: 'var(--font-body)', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {label}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: active ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
      }}>{count}</span>
    </button>
  );
}
