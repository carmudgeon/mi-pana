import React from 'react';
import './TradeHero.css';

export default function TradeHero({ title, body, ctaLabel, onCtaClick }) {
  return (
    <div className="trade-hero">
      <h3>{title}</h3>
      <p>{body}</p>
      <button className="trade-hero-pill" onClick={onCtaClick}>⇄ {ctaLabel}</button>
    </div>
  );
}
