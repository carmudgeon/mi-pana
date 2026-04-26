import React from 'react';
import TradeHero from '../components/TradeHero.jsx';
import DealSide from '../components/DealSide.jsx';
import TabBar from '../components/TabBar.jsx';
import { t } from '../i18n.js';

function TradeCard({ trade, lang, onAccept, onReject }) {
  const date = new Date(trade.createdAt);
  const dateStr = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{
      margin: '0 var(--screen-margin) 12px',
      background: '#fff', border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)', padding: 14,
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
          letterSpacing: '0.02em',
        }}>
          {t(lang, 'tradeDate')} {dateStr}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
          color: 'var(--c-green)',
        }}>
          {trade.canGive.length} ↔ {trade.canGet.length}
        </div>
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

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onAccept(trade)} style={{
          flex: 1, padding: 10, borderRadius: 'var(--r-button)',
          background: 'var(--c-green)', color: '#fff', border: 'none',
          fontSize: 12, fontWeight: 800, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          {t(lang, 'acceptTrade')}
        </button>
        <button onClick={() => onReject(trade.id)} style={{
          flex: 1, padding: 10, borderRadius: 'var(--r-button)',
          background: '#fff', color: 'var(--muted)',
          border: '1px solid var(--line)',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          {t(lang, 'deleteTrade')}
        </button>
      </div>
    </div>
  );
}

export default function TradeMatchesScreen({ lang, trades, onAcceptTrade, onRejectTrade, onNavigate }) {
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '8px 18px 12px' }}>
        <b style={{ display: 'block', fontSize: 18, fontFamily: 'var(--font-display)' }}>{t(lang, 'tradeTitle')}</b>
        <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {trades.length > 0 ? `${trades.length} ${trades.length === 1 ? 'trueque' : 'trueques'}` : ''}
        </span>
      </div>

      <TradeHero title={t(lang, 'tradeHeroTitle')} body={t(lang, 'tradeHeroBody', 47, 23)}
        ctaLabel={t(lang, 'findMatch')} onCtaClick={() => onNavigate?.('scan')} />

      <div style={{ margin: '6px 18px 12px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em' }}>
          {t(lang, 'myTrades')}
        </h3>
      </div>

      <div style={{ flex: 1 }}>
        {trades.length === 0 ? (
          <div style={{
            margin: '0 var(--screen-margin)',
            textAlign: 'center', padding: 40, color: 'var(--muted)',
            fontSize: 13, background: 'rgba(13,16,36,0.03)',
            borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
            lineHeight: 1.5,
          }}>
            {t(lang, 'noTrades')}
          </div>
        ) : (
          trades.map(trade => (
            <TradeCard key={trade.id} trade={trade} lang={lang}
              onAccept={onAcceptTrade} onReject={onRejectTrade} />
          ))
        )}
      </div>

      <TabBar active="trade" onNavigate={onNavigate} />
    </div>
  );
}
