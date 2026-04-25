import React from 'react';
import TradeHero from '../components/TradeHero.jsx';
import MatchCard from '../components/MatchCard.jsx';
import TabBar from '../components/TabBar.jsx';
import { MOCK_MATCHES } from '../data.js';
import { t } from '../i18n.js';

export default function TradeMatchesScreen({ lang, onNavigate }) {
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '8px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <b style={{ display: 'block', fontSize: 18, fontFamily: 'var(--font-display)' }}>{t(lang, 'tradeTitle')}</b>
          <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{t(lang, 'nearbyCount', 12)}</span>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: '1px solid var(--line)', display: 'grid', placeItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0E13" strokeWidth="2.4" strokeLinecap="round">
            <path d="M3 6h18M6 12h12M10 18h4"/>
          </svg>
        </div>
      </div>

      <TradeHero title={t(lang, 'tradeHeroTitle')} body={t(lang, 'tradeHeroBody', 47, 23)}
        ctaLabel={t(lang, 'findMatch')} onCtaClick={() => { /* TODO: match search modal */ }} />

      <div style={{ margin: '6px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em' }}>
          {t(lang, 'bestMatches')}
        </h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--muted)' }}>{t(lang, 'filter')}</div>
      </div>

      <div style={{ flex: 1 }}>
        {MOCK_MATCHES.map((m, i) => (
          <MatchCard key={i} match={m} proposeLabel={t(lang, 'proposeTrade')}
            chatLabel={t(lang, 'chat')} outLabel={t(lang, 'outLabel')}
            inLabel={t(lang, 'inLabel')} cardsLabel={t(lang, 'cards')} />
        ))}
      </div>

      <TabBar active="trade" onNavigate={onNavigate} />
    </div>
  );
}
