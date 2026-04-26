import React, { useState } from 'react';
import TeamHero from '../components/TeamHero.jsx';
import FilterChip from '../components/FilterChip.jsx';
import Sticker from '../components/Sticker.jsx';
import TabBar from '../components/TabBar.jsx';
import { buildTeamStickers, TEAMS } from '../data.js';
import { t } from '../i18n.js';

export default function TeamDetailScreen({ team, collection, setSticker, lang, onBack, onNavigate }) {
  const [filter, setFilter] = useState('all');
  const stickers = buildTeamStickers(team.code);
  const teamIndex = TEAMS.findIndex(tm => tm.code === team.code) + 1;

  const stickerStates = stickers.map(s => {
    const qty = collection[s.id] || 0;
    if (qty === 0) return { ...s, state: 'miss', qty };
    if (qty >= 2) return { ...s, state: 'dup', qty };
    return { ...s, state: 'owned', qty };
  });

  const counts = {
    all: stickerStates.length,
    owned: stickerStates.filter(s => s.state === 'owned' || s.state === 'dup').length,
    miss: stickerStates.filter(s => s.state === 'miss').length,
    dup: stickerStates.filter(s => s.state === 'dup').length,
  };
  const pct = counts.all > 0 ? Math.round((counts.owned / counts.all) * 100) : 0;
  const allOwned = counts.owned === counts.all;

  const filtered = stickerStates.filter(s => {
    if (filter === 'owned') return s.state === 'owned' || s.state === 'dup';
    if (filter === 'miss') return s.state === 'miss';
    if (filter === 'dup') return s.state === 'dup';
    return true;
  });

  const handleMarkAll = () => {
    stickers.forEach(s => {
      if ((collection[s.id] || 0) < 1) setSticker(s.id, 1);
    });
  };

  const handleUnmarkAll = () => {
    stickers.forEach(s => setSticker(s.id, 0));
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)',
          padding: '6px 12px', color: 'var(--ink)', fontWeight: 700, fontSize: 10,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>← {t(lang, 'back')}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--muted)' }}>
          {String(teamIndex).padStart(2, '0')} / {TEAMS.length}
        </div>
      </div>

      <TeamHero team={team} pct={pct} groupLabel={t(lang, 'group')} cardsLabel={t(lang, 'cards')} />

      {/* Mark all / Unmark all */}
      <div style={{ margin: '0 var(--screen-margin) 8px' }}>
        <button
          onClick={allOwned ? handleUnmarkAll : handleMarkAll}
          style={{
            padding: '8px 14px', borderRadius: 'var(--r-button)',
            background: allOwned ? '#fff' : 'var(--c-green)',
            color: allOwned ? 'var(--muted)' : '#fff',
            border: allOwned ? '1px solid var(--line)' : 'none',
            fontSize: 11, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {allOwned ? '↩ ' + t(lang, 'unmarkAll') : '✓✓ ' + t(lang, 'markAll')}
        </button>
      </div>

      <div className="hide-scrollbar" style={{ margin: '0 var(--screen-margin) 12px', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <FilterChip label={t(lang, 'filterAll')} count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label={t(lang, 'filterOwned')} count={counts.owned} active={filter === 'owned'} onClick={() => setFilter('owned')} />
        <FilterChip label={t(lang, 'filterMissing')} count={counts.miss} active={filter === 'miss'} onClick={() => setFilter('miss')} />
        <FilterChip label={t(lang, 'filterDup')} count={counts.dup} active={filter === 'dup'} onClick={() => setFilter('dup')} />
      </div>

      <div style={{
        margin: '0 var(--screen-margin) 14px', display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'start', flex: 1,
      }}>
        {filtered.map((s, i) => (
          <Sticker key={s.id} sticker={s} state={s.state}
            dupCount={s.qty >= 2 ? s.qty : undefined}
            qty={s.qty}
            index={i} addLabel={t(lang, 'add')}
            onIncrement={() => setSticker(s.id, s.qty + 1)}
            onDecrement={() => setSticker(s.id, Math.max(0, s.qty - 1))}
          />
        ))}

      </div>

      <TabBar active="teams" onNavigate={onNavigate} />
    </div>
  );
}
