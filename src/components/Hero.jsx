import React from 'react';
import './Hero.css';

export default function Hero({ owned, total, pct, userName, eyebrow, completedLabel, phrase, em }) {
  const parts = phrase.split(em);

  return (
    <div className="hero">
      <div className="hero-eyebrow">{eyebrow}</div>
      <div className="hero-title">
        {parts[0]}<em>{em}</em>{parts[1]}
      </div>
      <div className="hero-stats">
        <div className="hero-big">{owned}<small>/{total}</small></div>
        <div className="hero-right"><b>{pct}%</b>{completedLabel}</div>
      </div>
      <div className="hero-progress"><div className="hero-progress-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
