import React, { useState } from 'react';
import TabBar from '../components/TabBar.jsx';
import FilterChip from '../components/FilterChip.jsx';
import { TEAMS, getTeamAccent } from '../data.js';
import { t } from '../i18n.js';

function darkenHex(hex, amount = 0.55) {
  const h = hex.replace('#', '');
  const r = Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount));
  return `rgb(${r},${g},${b})`;
}

const STICKERS_PER_TEAM = 18;

function buildAllStickers(collection) {
  return TEAMS.map(team => {
    const stickers = Array.from({ length: STICKERS_PER_TEAM }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      const id = `${team.code}-${num}`;
      const qty = collection[id] || 0;
      return { id, num, qty };
    });
    return { team, stickers };
  });
}

export default function FullGridScreen({ collection, setSticker, lang, onBack, onNavigate }) {
  const [filter, setFilter] = useState('all');

  const teamGroups = buildAllStickers(collection);

  const allStickers = teamGroups.flatMap(g => g.stickers);
  const counts = {
    all: allStickers.length,
    owned: allStickers.filter(s => s.qty >= 1).length,
    miss: allStickers.filter(s => s.qty === 0).length,
    dup: allStickers.filter(s => s.qty >= 2).length,
  };

  const filterSticker = (s) => {
    if (filter === 'owned') return s.qty >= 1;
    if (filter === 'miss') return s.qty === 0;
    if (filter === 'dup') return s.qty >= 2;
    return true;
  };

  const visibleGroups = teamGroups
    .map(g => ({ ...g, stickers: g.stickers.filter(filterSticker) }))
    .filter(g => g.stickers.length > 0);

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)',
          padding: '6px 12px', color: 'var(--ink)', fontWeight: 700, fontSize: 10,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>← {t(lang, 'back')}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em', color: 'var(--muted)' }}>
          {counts.owned} / {counts.all}
        </div>
      </div>

      <div style={{ padding: '12px 16px 8px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.01em' }}>
          {t(lang, 'fullGrid')}
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.04em' }}>
          {counts.miss > 0 ? t(lang, 'missingCount', counts.miss) : t(lang, 'albumComplete')}
        </div>
      </div>

      <div className="hide-scrollbar" style={{ margin: '0 var(--screen-margin) 10px', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <FilterChip label={t(lang, 'filterAll')} count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label={t(lang, 'filterOwned')} count={counts.owned} active={filter === 'owned'} onClick={() => setFilter('owned')} />
        <FilterChip label={t(lang, 'filterMissing')} count={counts.miss} active={filter === 'miss'} onClick={() => setFilter('miss')} />
        <FilterChip label={t(lang, 'filterDup')} count={counts.dup} active={filter === 'dup'} onClick={() => setFilter('dup')} />
      </div>

      <div style={{ margin: '0 var(--screen-margin)', flex: 1, paddingBottom: 16 }}>
        {visibleGroups.map(({ team, stickers }) => {
          const accent = getTeamAccent(team.code);
          const teamOwned = stickers.filter(s => s.qty >= 1).length;
          return (
            <div key={team.code} style={{ marginBottom: 14 }}>
              {/* Team header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 6, padding: '0 2px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5,
                    background: `linear-gradient(135deg, ${team.c1} 0 50%, ${team.c2} 50% 100%)`,
                    display: 'grid', placeItems: 'center',
                    fontSize: 7, fontWeight: 800, color: darkenHex(team.c1), fontFamily: 'var(--font-display)',
                    textShadow: '0 0 2px rgba(255,255,255,0.6)',
                  }}>{team.code}</div>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                    letterSpacing: '-0.005em',
                  }}>{team.name}</span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)',
                  letterSpacing: '0.04em',
                }}>{teamOwned}/{stickers.length}</span>
              </div>

              {/* Sticker cells */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
                gap: 4,
              }}>
                {stickers.map(s => {
                  const owned = s.qty >= 1;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSticker(s.id, owned ? Math.max(0, s.qty - 1) : 1)}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: 5,
                        border: owned ? 'none' : '1px solid var(--line)',
                        background: owned ? accent : 'rgba(13,16,36,0.03)',
                        cursor: 'pointer', padding: 0,
                        position: 'relative',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 0,
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 7, fontWeight: 800, lineHeight: 1,
                        color: owned ? 'rgba(255,255,255,0.7)' : 'var(--muted)',
                        letterSpacing: '0.02em',
                      }}>{team.code}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8, fontWeight: 700, lineHeight: 1,
                        color: owned ? '#fff' : 'var(--muted)',
                      }}>{s.num}</span>
                      {s.qty >= 2 && (
                        <div style={{
                          position: 'absolute', top: -3, right: -3,
                          minWidth: 12, height: 12, borderRadius: 6,
                          background: 'var(--c-magenta)', color: '#fff',
                          fontSize: 7, fontWeight: 800, fontFamily: 'var(--font-mono)',
                          display: 'grid', placeItems: 'center',
                          padding: '0 2px',
                        }}>
                          {s.qty - 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <TabBar active="home" onNavigate={onNavigate} />
    </div>
  );
}
