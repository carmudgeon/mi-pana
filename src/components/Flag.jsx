import React from 'react';

export default function Flag({ team, size = 38, radius = 10, fontSize = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: `linear-gradient(135deg, ${team.c1} 0 50%, ${team.c2} 50% 100%)`,
      display: 'grid', placeItems: 'center',
      color: '#fff', fontWeight: 800, fontSize,
      fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    }}>
      {team.code}
    </div>
  );
}
