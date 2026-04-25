import React from 'react';
import Flag from './Flag.jsx';
import { getTeamAccent } from '../data.js';
import './TeamRow.css';

export default function TeamRow({ team, owned, total, groupLabel, onClick }) {
  const accent = getTeamAccent(team.code);
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
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
      <div style={{ textAlign: 'right' }}>
        <div className="team-row-pct">{pct}<span className="team-row-pct-sign">%</span></div>
      </div>
    </div>
  );
}
