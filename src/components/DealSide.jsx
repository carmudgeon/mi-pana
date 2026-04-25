import React from 'react';

const ArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v15"/><path d="M5 13l7 7 7-7"/>
  </svg>
);
const ArrowUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V5"/><path d="M5 11l7-7 7 7"/>
  </svg>
);

export default function DealSide({ direction, chips, ariaLabel }) {
  const isGive = direction === 'give';
  const color = isGive ? 'var(--c-red)' : 'var(--c-green)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
      <div aria-label={ariaLabel} style={{
        width: 32, height: 32, borderRadius: 8, background: color,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
        display: 'grid', placeItems: 'center',
      }}>
        {isGive ? <ArrowDown /> : <ArrowUp />}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap', alignItems: 'center', minWidth: 0 }}>
        {chips.slice(0, 2).map(([code, num], j) => (
          <div key={j} style={{
            height: 30, padding: '0 8px', borderRadius: 7,
            background: color, border: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, color: '#fff',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '9.5px', fontWeight: 800,
              letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>{code}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#fff' }}>{num}</span>
          </div>
        ))}
        {chips.length > 2 && <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: 'rgba(255,255,255,0.55)', padding: '0 2px', letterSpacing: '0.04em',
        }}>+{chips.length - 2}</span>}
      </div>
    </div>
  );
}
