import React, { useState, useEffect } from 'react';
import TradeHero from '../components/TradeHero.jsx';
import DealSide from '../components/DealSide.jsx';
import QrGenerator from '../components/QrGenerator.jsx';
import QrScanner from '../components/QrScanner.jsx';
import TabBar from '../components/TabBar.jsx';
import { countDuplicates } from '../utils/qrCodec.js';
import { t } from '../i18n.js';
import { useAuth } from '../context/useAuth.js';
import TradeMatchingService from '../services/TradeMatchingService.js';
import '../screens/ScanScreen.css';

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

const TABS = [
  { key: 'trades', labelKey: 'myTrades' },
  { key: 'generate', labelKey: 'generateTab' },
  { key: 'scan', labelKey: 'scanTab' },
];

// Avatar background colours for match cards (cycles by index)
const AVATAR_COLORS = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#F4A261', '#264653'];

function MatchCard({ match, index, lang, onPropose }) {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = (match.username ?? '?')[0].toUpperCase();

  return (
    <div style={{
      margin: '0 var(--screen-margin) 14px',
      background: '#fff', border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)', padding: 14,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          background: avatarColor, display: 'grid', placeItems: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{match.username}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
            letterSpacing: '0.02em', marginTop: 2,
          }}>
            {match.canGive.length} ↔ {match.canGet.length} {t(lang, 'cards')}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20,
          color: 'var(--c-green)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textAlign: 'right',
        }}>
          {match.score}
          <small style={{
            fontSize: 10, color: 'var(--muted)', fontWeight: 700,
            letterSpacing: '0.06em', display: 'block', textAlign: 'right',
          }}>
            {t(lang, 'cards')}
          </small>
        </div>
      </div>

      {/* Deal panel */}
      <div style={{
        background: '#0E1426', borderRadius: 'var(--r-panel)',
        overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        <DealSide
          direction="give"
          chips={match.canGive.map(id => id.split('-'))}
          ariaLabel={t(lang, 'outLabel')}
        />
        <div style={{
          height: 1, margin: '0 12px',
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)',
        }} />
        <DealSide
          direction="get"
          chips={match.canGet.map(id => id.split('-'))}
          ariaLabel={t(lang, 'inLabel')}
        />
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => onPropose?.({ canGive: match.canGive, canGet: match.canGet })}
          style={{
            flex: 1, border: 0, borderRadius: 'var(--r-button)', padding: 10,
            background: 'var(--ink)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 12,
            letterSpacing: '0.02em', cursor: 'pointer',
          }}
        >
          {t(lang, 'proposeTrade')}
        </button>
      </div>
    </div>
  );
}

export default function TradeMatchesScreen({ lang, collection, trades, onAcceptTrade, onRejectTrade, onProposeTrade, onNavigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('trades');
  const [tradeMatches, setTradeMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesMessage, setMatchesMessage] = useState(null);
  const [matchesTimedOut, setMatchesTimedOut] = useState(false);
  const dupCount = countDuplicates(collection);

  // Publish collection snapshot whenever collection changes and user is authenticated
  useEffect(() => {
    if (!user) return;
    TradeMatchingService.publishCollection(user.id, collection).catch(() => {
      // Silently ignore publish errors — non-critical background operation
    });
  }, [user, collection]);

  // Fetch trade matches whenever collection changes and user is authenticated
  useEffect(() => {
    if (!user) {
      setTradeMatches([]);
      setMatchesMessage(null);
      setMatchesTimedOut(false);
      return;
    }

    let cancelled = false;
    setMatchesLoading(true);
    setMatchesTimedOut(false);
    setMatchesMessage(null);

    TradeMatchingService.findMatches(collection).then(results => {
      if (cancelled) return;
      setTradeMatches(results);
      // The service attaches a .message property to the empty array for special cases
      if (results.length === 0 && results.message) {
        const isTimeout = results.message.includes('tardó') || results.message.includes('servidor');
        setMatchesTimedOut(isTimeout);
        setMatchesMessage(results.message);
      } else {
        setMatchesMessage(null);
        setMatchesTimedOut(false);
      }
    }).catch(() => {
      if (cancelled) return;
      setTradeMatches([]);
      setMatchesTimedOut(true);
      setMatchesMessage('Error al buscar matches. Intenta de nuevo.');
    }).finally(() => {
      if (!cancelled) setMatchesLoading(false);
    });

    return () => { cancelled = true; };
  }, [user, collection]);

  const handlePropose = (proposal) => {
    onProposeTrade?.(proposal);
    setActiveTab('trades');
  };

  const handleRetryMatches = () => {
    if (!user) return;
    setMatchesLoading(true);
    setMatchesTimedOut(false);
    setMatchesMessage(null);

    TradeMatchingService.findMatches(collection).then(results => {
      setTradeMatches(results);
      if (results.length === 0 && results.message) {
        const isTimeout = results.message.includes('tardó') || results.message.includes('servidor');
        setMatchesTimedOut(isTimeout);
        setMatchesMessage(results.message);
      }
    }).catch(() => {
      setMatchesTimedOut(true);
      setMatchesMessage('Error al buscar matches. Intenta de nuevo.');
    }).finally(() => {
      setMatchesLoading(false);
    });
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '8px 18px 12px' }}>
        <b style={{ display: 'block', fontSize: 18, fontFamily: 'var(--font-display)' }}>{t(lang, 'tradeTitle')}</b>
        {trades.length > 0 && (
          <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {trades.length} {trades.length === 1 ? 'trueque' : 'trueques'}
          </span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="scan-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`scan-tab ${activeTab === tab.key ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(lang, tab.labelKey)}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, paddingBottom: 16 }}>
        {activeTab === 'trades' && (
          <>
            <TradeHero title={t(lang, 'tradeHeroTitle')} body={t(lang, 'tradeHeroBody', dupCount)}
              ctaLabel={t(lang, 'scanTab')} onCtaClick={() => setActiveTab('scan')} />

            {/* Real-user trade matches (authenticated only) */}
            {user && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ margin: '6px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em' }}>
                    {t(lang, 'bestMatches')}
                  </h3>
                  {matchesLoading && (
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      Buscando…
                    </span>
                  )}
                </div>

                {matchesLoading ? (
                  <div style={{
                    margin: '0 var(--screen-margin)',
                    textAlign: 'center', padding: 32, color: 'var(--muted)',
                    fontSize: 13, background: 'rgba(13,16,36,0.03)',
                    borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
                  }}>
                    Buscando matches…
                  </div>
                ) : matchesTimedOut ? (
                  <div style={{
                    margin: '0 var(--screen-margin)',
                    textAlign: 'center', padding: 32, color: 'var(--muted)',
                    fontSize: 13, background: 'rgba(13,16,36,0.03)',
                    borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
                    lineHeight: 1.5,
                  }}>
                    <div style={{ marginBottom: 12 }}>{matchesMessage}</div>
                    <button
                      onClick={handleRetryMatches}
                      style={{
                        padding: '8px 20px', borderRadius: 'var(--r-button)',
                        background: 'var(--ink)', color: '#fff', border: 'none',
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : tradeMatches.length === 0 ? (
                  <div style={{
                    margin: '0 var(--screen-margin)',
                    textAlign: 'center', padding: 32, color: 'var(--muted)',
                    fontSize: 13, background: 'rgba(13,16,36,0.03)',
                    borderRadius: 'var(--r-card)', border: '1px dashed var(--line-strong)',
                    lineHeight: 1.5,
                  }}>
                    {matchesMessage ?? 'No se encontraron matches por ahora.'}
                  </div>
                ) : (
                  tradeMatches.map((match, i) => (
                    <MatchCard
                      key={match.userId}
                      match={match}
                      index={i}
                      lang={lang}
                      onPropose={handlePropose}
                    />
                  ))
                )}
              </div>
            )}

            <div style={{ margin: '6px 18px 12px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em' }}>
                {t(lang, 'myTrades')}
              </h3>
            </div>

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
          </>
        )}

        {activeTab === 'generate' && (
          <QrGenerator collection={collection} lang={lang} />
        )}

        {activeTab === 'scan' && (
          <QrScanner collection={collection} lang={lang} onProposeTrade={handlePropose} />
        )}
      </div>

      <TabBar active="trade" onNavigate={onNavigate} />
    </div>
  );
}
