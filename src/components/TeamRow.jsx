import React from 'react';
import Flag from './Flag.jsx';
import { getTeamAccent } from '../data.js';
import './TeamRow.css';

export default function TeamRow({ team, owned, total, groupLabel, onClick, onToggleAll }) {
  const accent = getTeamAccent(team.code);
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  const complete = owned === total;

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleAll?.(!complete);
  };

  return (
    <div className="team-row" onClick={onClick}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: accent }} />
      <Flag team={team} />
      <div className="team-row-meta">
        <div className="team-row-name">{team.name}</div>
        <div className="team-row-sub">{groupLabel} {team.group} · {owned}/{total}</div>
        <div className="team-row-bar">
          <span className="team-row-bar-fill" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="team-row-pct">{pct}<span className="team-row-pct-sign">%</span></div>
        {onToggleAll && (
          <button
            onClick={handleToggle}
            title={complete ? 'Desmarcar' : 'Marcar todas'}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: complete ? accent : 'rgba(13,16,36,0.05)',
              color: complete ? '#fff' : 'var(--muted)',
              border: complete ? 'none' : '1px solid var(--line)',
              display: 'grid', placeItems: 'center',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              padding: 0, fontFamily: 'var(--font-body)',
            }}
          >
            {complete ? '↩' : '✓✓'}
          </button>
        )}
      </div>
    </div>
  );
}
