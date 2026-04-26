import React, { useState } from 'react';
import Hero from '../components/Hero.jsx';
import QuickAction from '../components/QuickAction.jsx';
import TeamRow from '../components/TeamRow.jsx';
import TabBar from '../components/TabBar.jsx';
import { TEAMS } from '../data.js';
import { t } from '../i18n.js';

const CONFEDS = [
  { code: 'ALL', label: 'Todas', color: 'var(--ink)' },
  { code: 'CONMEBOL', label: 'Conmebol', color: 'var(--c-yellow)' },
  { code: 'UEFA', label: 'UEFA', color: 'var(--c-blue)' },
  { code: 'CONCACAF', label: 'Concacaf', color: 'var(--c-teal)' },
  { code: 'CAF', label: 'CAF', color: 'var(--c-red)' },
  { code: 'AFC', label: 'AFC', color: 'var(--c-violet)' },
  { code: 'OFC', label: 'OFC', color: 'var(--c-orange)' },
];

export default function AlbumOverviewScreen({ collection, setSticker, lang, userName, onSelectTeam, onNavigate }) {
  const [search, setSearch] = useState('');
  const [confedFilter, setConfedFilter] = useState('ALL');

  const teamStats = TEAMS.map(team => {
    let owned = 0;
    for (let i = 1; i <= 18; i++) {
      const id = `${team.code}-${String(i).padStart(2, '0')}`;
      if ((collection[id] || 0) >= 1) owned++;
    }
    return { team, owned, total: 18 };
  });

  const totalOwned = teamStats.reduce((sum, ts) => sum + ts.owned, 0);
  const totalStickers = teamStats.reduce((sum, ts) => sum + ts.total, 0);
  const pct = totalStickers > 0 ? Math.round((totalOwned / totalStickers) * 100) : 0;

  const filteredTeams = teamStats
    .filter(({ team }) => {
      if (confedFilter !== 'ALL' && team.confed !== confedFilter) return false;
      if (search && !team.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (b.owned / b.total) - (a.owned / a.total));

  const handleToggleTeam = (teamCode, markAll) => {
    for (let i = 1; i <= 18; i++) {
      const id = `${teamCode}-${String(i).padStart(2, '0')}`;
      if (markAll) {
        if ((collection[id] || 0) < 1) setSticker(id, 1);
      } else {
        setSticker(id, 0);
      }
    }
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '8px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--c-blue), #3056c8)',
            color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
          }}>{userName?.[0] || 'D'}</div>
          <div style={{ fontSize: 13, lineHeight: 1.2 }}>
            {t(lang, 'greeting')} <b style={{ display: 'block', fontWeight: 800, fontSize: 15 }}>{userName}</b>
            <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{t(lang, 'subtitle')}</span>
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: '1px solid var(--line)', display: 'grid', placeItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0E13" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
          </svg>
        </div>
      </div>

      <Hero owned={totalOwned} total={totalStickers} pct={pct} userName={userName}
        eyebrow={t(lang, 'albumEyebrow')} completedLabel={t(lang, 'completed')} />

      <div style={{ margin: '0 var(--screen-margin)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <QuickAction glyph="✓✓" label={t(lang, 'addAction')} color="var(--c-red)" onClick={() => {
          TEAMS.forEach(team => {
            for (let i = 1; i <= 18; i++) {
              const id = `${team.code}-${String(i).padStart(2, '0')}`;
              if (!(collection[id] >= 1)) setSticker(id, 1);
            }
          });
        }} />
        <QuickAction glyph="⇄" label={t(lang, 'tradeAction')} color="var(--c-blue)" onClick={() => onNavigate?.('trade')} />
        <QuickAction glyph="◐" label={t(lang, 'missingAction')} color="var(--c-green)" onClick={() => onNavigate?.('grid')} />
        <QuickAction glyph="⌘" label={t(lang, 'scanAction')} color="#0B0E13" onClick={() => onNavigate?.('trade')} />
      </div>

      <div style={{ margin: '18px 18px 8px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em' }}>
          {t(lang, 'teamsHeader')} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.04em' }}>({filteredTeams.length})</span>
        </h3>
      </div>

      {/* Search */}
      <div style={{
        margin: '0 var(--screen-margin) 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-card)',
        padding: '0 12px',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
        </svg>
        <input
          type="text"
          placeholder={t(lang, 'searchTeam')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            color: 'var(--ink)', padding: '10px 0', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: 13,
          }}
        />
      </div>

      {/* Confederation filter */}
      <div className="hide-scrollbar" style={{ margin: '0 var(--screen-margin) 10px', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {CONFEDS.map(c => (
          <button
            key={c.code}
            onClick={() => setConfedFilter(c.code)}
            style={{
              flexShrink: 0,
              padding: '6px 10px', borderRadius: 'var(--r-pill)',
              background: confedFilter === c.code ? c.color : '#fff',
              color: confedFilter === c.code ? '#fff' : 'var(--ink)',
              border: `1px solid ${confedFilter === c.code ? c.color : 'var(--line)'}`,
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Team rows */}
      <div style={{ margin: '0 var(--screen-margin)', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {filteredTeams.map(({ team, owned, total }) => (
          <TeamRow key={team.code} team={team} owned={owned} total={total}
            groupLabel={t(lang, 'group')} onClick={() => onSelectTeam?.(team)}
            onToggleAll={(markAll) => handleToggleTeam(team.code, markAll)}
          />
        ))}
        {filteredTeams.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
            {t(lang, 'noTeamsFound')}
          </div>
        )}
      </div>

      <TabBar active="home" onNavigate={onNavigate} />
    </div>
  );
}
