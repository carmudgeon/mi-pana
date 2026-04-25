import React from 'react';
import Hero from '../components/Hero.jsx';
import QuickAction from '../components/QuickAction.jsx';
import TeamRow from '../components/TeamRow.jsx';
import TabBar from '../components/TabBar.jsx';
import { TEAMS } from '../data.js';
import { t } from '../i18n.js';

export default function AlbumOverviewScreen({ collection, lang, userName, onSelectTeam, onNavigate }) {
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

  const sortedTeams = [...teamStats].sort((a, b) => (b.owned / b.total) - (a.owned / a.total));

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
        <QuickAction glyph="＋" label={t(lang, 'addAction')} color="var(--c-red)" />
        <QuickAction glyph="⇄" label={t(lang, 'tradeAction')} color="var(--c-blue)" onClick={() => onNavigate?.('trade')} />
        <QuickAction glyph="◐" label={t(lang, 'missingAction')} color="var(--c-green)" />
        <QuickAction glyph="⌘" label={t(lang, 'scanAction')} color="#0B0E13" />
      </div>

      <div style={{ margin: '18px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em' }}>
          {t(lang, 'teamsHeader')}
        </h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {t(lang, 'seeAll')} ({TEAMS.length})
        </div>
      </div>

      <div style={{ margin: '0 var(--screen-margin)', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {sortedTeams.slice(0, 8).map(({ team, owned, total }) => (
          <TeamRow key={team.code} team={team} owned={owned} total={total}
            groupLabel={t(lang, 'group')} onClick={() => onSelectTeam?.(team)} />
        ))}
      </div>

      <TabBar active="home" onNavigate={onNavigate} />
    </div>
  );
}
