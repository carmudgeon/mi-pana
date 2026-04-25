import React from 'react';
import DealSide from './DealSide.jsx';
import './MatchCard.css';

export default function MatchCard({ match, proposeLabel, chatLabel, outLabel, inLabel, cardsLabel }) {
  return (
    <div className="match-card">
      <div className="match-top">
        <div className="match-avatar" style={{ background: match.avatar }}>{match.name[0]}</div>
        <div className="match-who">
          <div className="match-who-name">{match.name}</div>
          <div className="match-who-sub">{match.loc}</div>
        </div>
        <div className="match-score">{match.score}<small>{cardsLabel}</small></div>
      </div>
      <div className="match-deal">
        <DealSide direction="give" chips={match.give} ariaLabel={outLabel} />
        <div className="match-deal-divider" />
        <DealSide direction="get" chips={match.get} ariaLabel={inLabel} />
      </div>
      <div className="match-cta">
        <button className="match-cta-primary">{proposeLabel}</button>
        <button className="match-cta-ghost">{chatLabel}</button>
      </div>
    </div>
  );
}
