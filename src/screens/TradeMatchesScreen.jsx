import React from 'react';
import TradeHero from '../components/TradeHero.jsx';
import MatchCard from '../components/MatchCard.jsx';
import DealSide from '../components/DealSide.jsx';
import TabBar from '../components/TabBar.jsx';
import { MOCK_MATCHES } from '../data.js';
import { t } from '../i18n.js';

function PendingTradeCard({ trade, lang, onDismiss }) {
  return (
    <div style={{
      margin: '0 var(--screen-margin) 14px',
      background: '#fff', border: '2px solid var(--c-green)',
      borderRadius: 'var(--r-card)', padding: 14,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 4px 16px rgba(20,168,94,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            background: 'var(--c-green)', color: '#fff',
            padding: '2px 8px', borderRadius: 'var(--r-pill)',
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.06em',
          }}>NUEVO</span>
          {t(lang, 'proposeTrade')}
        </div>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 18, padding: 0, lineHeight: 1,
        }}>×</button>
      </div>

      <div style={{
        background: '#0E1426', borderRadius: 'var(--r-panel)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        <DealSide direction="give" chips={trade.canGive.map(id => id.split('-'))} ariaLabel={t(lang, 'outLabel')} />
        <div style={{
          height: 1, margin: '0 12px',
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)',
        }} />
        <DealSide direction="get" chips={trade.canGet.map(id => id.split('-'))} ariaLabel={t(lang, 'inLabel')} />
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
        textAlign: 'center',
      }}>
        {trade.canGive.length} ↓ · {trade.canGet.length} ↑
      </div>
    </div>
  );
}

export default function TradeMatchesScreen({ lang, pendingTrade, onClearTrade, onNavigate }) {
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

      {/* Pending trade from QR scan */}
      {pendingTrade && (
        <PendingTradeCard trade={pendingTrade} lang={lang} onDismiss={onClearTrade} />
      )}

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
