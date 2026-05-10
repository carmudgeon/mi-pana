import React from 'react';
import { TEAMS, STICKERS_PER_TEAM } from '../data.js';
import { buildPrintableMissingList } from '../utils/buildPrintableMissingList.js';
import { t } from '../i18n.js';
import './PrintableMissingList.css';

function formatDate(lang) {
  const locale = lang === 'en' ? 'en-US' : 'es-CO';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
}

export default function PrintableMissingList({ collection, lang }) {
  const entries = buildPrintableMissingList(collection, TEAMS, STICKERS_PER_TEAM);

  const totalAll = TEAMS.length * STICKERS_PER_TEAM;
  const totalMissing = entries.reduce((sum, e) => sum + e.missingNums.length, 0);
  const totalOwned = totalAll - totalMissing;

  return (
    <div className="printable-missing">
      <header className="printable-missing__header">
        <span className="printable-missing__title">{t(lang, 'missingPrintTitle')}</span>
        <span>{totalOwned} / {totalAll}</span>
        <span>{formatDate(lang)}</span>
      </header>

      {entries.length === 0 ? (
        <div className="printable-missing__empty">{t(lang, 'albumComplete')}</div>
      ) : (
        <div className="printable-missing__matrix">
          {entries.map(({ team, missingNums }) => (
            <div key={team.code} className="printable-missing__country">
              <span className="printable-missing__code">{team.code}</span>
              {missingNums.map(num => (
                <span key={num} className="printable-missing__num">{num}</span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
