import React from 'react';
import './Hero.css';

export default function Hero({ owned, total, pct, userName, eyebrow, completedLabel }) {
  return (
    <div className="hero">
      <div className="hero-eyebrow">{eyebrow}</div>
      <div className="hero-title">Vas <em>bien encaminado</em>,<br />{userName}.</div>
      <div className="hero-stats">
        <div className="hero-big">{owned}<small>/{total}</small></div>
        <div className="hero-right"><b>{pct}%</b>{completedLabel}</div>
      </div>
      <div className="hero-progress"><div className="hero-progress-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
