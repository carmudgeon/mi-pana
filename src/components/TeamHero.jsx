import React from 'react';
import Flag from './Flag.jsx';
import { getTeamAccent, STICKERS_PER_TEAM } from '../data.js';
import './TeamHero.css';

export default function TeamHero({ team, pct, groupLabel, cardsLabel }) {
  const accent = getTeamAccent(team.code);
  return (
    <div className="team-hero" style={{ background: accent }}>
      <Flag team={team} size={62} radius={14} fontSize={18} />
      <div className="team-hero-info">
        <div className="team-hero-name">{team.name}</div>
        <div className="team-hero-group">{groupLabel} {team.group} · {STICKERS_PER_TEAM} {cardsLabel}</div>
      </div>
      <div className="team-hero-ring" style={{ background: `conic-gradient(#fff 0 ${pct}%, rgba(255,255,255,0.25) 0)` }}>
        <div className="team-hero-ring-inner" style={{ background: accent }} />
        <b>{pct}%</b>
      </div>
    </div>
  );
}
