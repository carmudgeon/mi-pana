import React from 'react';
import './TabBar.css';

const TABS = [
  ['home', 'Álbum', '▦'],
  ['teams', 'Equipos', '◉'],
  ['trade', 'Trueque', '⇄'],
  ['scan', 'Escanear', '⊕'],
  ['me', 'Yo', '◍'],
];

export default function TabBar({ active = 'home', onNavigate }) {
  return (
    <nav className="tabbar">
      {TABS.map(([key, label, glyph]) => (
        <button key={key} className={`tab ${active === key ? 'on' : ''}`} onClick={() => onNavigate?.(key)}>
          <div className="tab-dot">{glyph}</div>
          <div>{label}</div>
        </button>
      ))}
    </nav>
  );
}
