# Mi Pana 26 Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark-themed sticker tracker with a mobile-first, light-themed 3-screen app matching the FIFA World Cup 2026 album mosaic visual language.

**Architecture:** Break the 1322-line monolith (`PaniniMundial2026.jsx`) into focused modules: a CSS token file, an i18n map, a data layer, shared components, 3 screen components, and a thin App shell with routing. Preserve the existing `usePersistentState` hook and localStorage collection. All CSS uses custom properties from the token system.

**Tech Stack:** React 18 + Vite, CSS custom properties (no Tailwind), Google Fonts (Archivo, Archivo Narrow, JetBrains Mono), no new dependencies.

---

## File Structure

```
src/
├── main.jsx                    # Entry point (exists, modify)
├── App.jsx                     # Shell: routing + state + layout
├── tokens.css                  # All design tokens as CSS custom properties
├── global.css                  # Reset, mosaic bg, base typography
├── i18n.js                     # Spanish/English string map
├── data.js                     # TEAMS, STADIUMS, TEAM_COLORS, buildAllStickers, mock trade data
├── hooks/
│   └── usePersistentState.js   # Extracted from monolith
├── components/
│   ├── Sticker.jsx             # 4 states: owned/miss/dup/add + accent rotation
│   ├── Sticker.css             # Sticker styles
│   ├── TeamRow.jsx             # Team list item with progress bar
│   ├── TeamRow.css
│   ├── QuickAction.jsx         # 4-up grid tile
│   ├── FilterChip.jsx          # Pill filter with count
│   ├── MatchCard.jsx           # Trade match card with deal panel
│   ├── MatchCard.css
│   ├── DealSide.jsx            # Give/get row for trade panel
│   ├── Hero.jsx                # Album overview hero progress card
│   ├── TeamHero.jsx            # Team detail hero card with ring
│   ├── TradeHero.jsx           # Trade screen hero card
│   ├── TabBar.jsx              # Bottom navigation
│   └── Flag.jsx                # Diagonal-split flag tile
├── screens/
│   ├── AlbumOverviewScreen.jsx # Screen 1
│   ├── TeamDetailScreen.jsx    # Screen 2
│   └── TradeMatchesScreen.jsx  # Screen 3
```

**Design handoff reference files** (read-only, not modified):
- `design_handoff_mi_pana_26/README.md`
- `design_handoff_mi_pana_26/tokens.json`
- `design_handoff_mi_pana_26/components.md`
- `design_handoff_mi_pana_26/Mi Pana Redesign.html`

---

### Task 1: Design Tokens + Global CSS

**Files:**
- Create: `src/tokens.css`
- Create: `src/global.css`
- Modify: `src/main.jsx`
- Modify: `index.html`

- [ ] **Step 1: Create `src/tokens.css`**

```css
:root {
  /* Stage */
  --bg: #0B1020;
  --panel: #141A2E;

  /* App surface */
  --ink: #0D1024;
  --paper: #FFFFFF;
  --paper-2: #F2F1ED;
  --line: rgba(13,16,36,0.10);
  --line-strong: rgba(13,16,36,0.22);
  --muted: #6B6E80;

  /* 8 mosaic colors */
  --c-yellow: #FFC60B;
  --c-orange: #FF6A1A;
  --c-red: #E61E3C;
  --c-magenta: #D81E78;
  --c-violet: #6E33CC;
  --c-blue: #1F4FE0;
  --c-teal: #00B3A4;
  --c-green: #14A85E;

  /* Typography */
  --font-display: 'Archivo Narrow', 'Archivo', sans-serif;
  --font-body: 'Archivo', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --sp-1: 4px;
  --sp-2: 6px;
  --sp-3: 8px;
  --sp-4: 10px;
  --sp-5: 12px;
  --sp-6: 14px;
  --sp-7: 16px;
  --sp-8: 18px;
  --sp-9: 22px;
  --sp-10: 32px;
  --screen-margin: 16px;

  /* Radius */
  --r-chip: 7px;
  --r-sticker: 12px;
  --r-button: 12px;
  --r-tile: 16px;
  --r-card: 18px;
  --r-panel: 14px;
  --r-hero: 24px;
  --r-team-hero: 22px;
  --r-trade-hero: 22px;
  --r-pill: 9999px;

  /* Shadows */
  --shadow-card: 0 4px 10px -4px rgba(0,0,0,0.10);
  --shadow-hero: 0 12px 32px rgba(11,16,32,0.28);
  --shadow-team-hero: 0 8px 20px rgba(11,16,32,0.15);
  --shadow-quick-icon: 0 4px 10px -4px rgba(0,0,0,0.4);
}
```

- [ ] **Step 2: Create `src/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Narrow:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
}

/* Mosaic background pattern — faint album-cover arcs */
.screen {
  min-height: 100vh;
  position: relative;
}
.screen::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 0% 14%, var(--c-yellow) 0 70px, transparent 70px),
    radial-gradient(circle at 100% 14%, var(--c-magenta) 0 90px, transparent 90px),
    radial-gradient(circle at 0% 100%, var(--c-blue) 0 120px, transparent 120px),
    radial-gradient(circle at 100% 100%, var(--c-green) 0 110px, transparent 110px),
    radial-gradient(circle at 50% 60%, var(--c-orange) 0 60px, transparent 60px),
    radial-gradient(circle at 30% 92%, var(--c-violet) 0 50px, transparent 50px),
    var(--paper);
  opacity: 0.10;
}
.screen > * { position: relative; z-index: 1; }

button { cursor: pointer; font-family: var(--font-body); }
```

- [ ] **Step 3: Update `index.html`**

Change the body background from `#0a0e1a` to `#FFFFFF`:

```html
<body style="margin: 0; background: #FFFFFF;">
```

- [ ] **Step 4: Update `src/main.jsx` to import CSS**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './tokens.css'
import './global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 5: Create minimal `src/App.jsx` placeholder**

```jsx
import React from 'react';

export default function App() {
  return <div className="screen" style={{ padding: 16 }}>Mi Pana 26 — redesign in progress</div>;
}
```

- [ ] **Step 6: Verify tokens load**

Run: `npx vite build`
Expected: Build succeeds. App shows white background with faint mosaic pattern and placeholder text.

- [ ] **Step 7: Commit**

```bash
git add src/tokens.css src/global.css src/main.jsx src/App.jsx index.html
git commit -m "feat: add design tokens and global CSS for Mi Pana 26 redesign"
```

---

### Task 2: i18n + Data Layer + Hooks

**Files:**
- Create: `src/i18n.js`
- Create: `src/data.js`
- Create: `src/hooks/usePersistentState.js`

- [ ] **Step 1: Create `src/i18n.js`**

```js
const strings = {
  es: {
    greeting: 'Hola,',
    subtitle: 'mundial 2026 · día 142',
    albumEyebrow: 'TU ÁLBUM · MI PANA 26',
    heroTitle: (name) => `Vas bien encaminado, ${name}.`,
    heroTitleEm: 'bien encaminado',
    completed: 'completado',
    addAction: 'Agregar',
    tradeAction: 'Cambiar',
    missingAction: 'Faltan',
    scanAction: 'Scanear',
    teamsHeader: 'Equipos',
    seeAll: 'Ver todos',
    group: 'Grupo',
    cards: 'cromos',
    back: 'Álbum',
    filterAll: 'Todos',
    filterOwned: 'Tengo',
    filterMissing: 'Faltan',
    filterDup: 'Repetidos',
    tradeTitle: 'Trueques',
    nearbyCount: (n) => `${n} panas cerca de ti`,
    tradeHeroTitle: 'Cambia tus repetidos.',
    tradeHeroBody: (dups, panas) => `Tienes ${dups} repetidos que ${panas} panas cerca de ti están buscando.`,
    findMatch: 'Buscar un match',
    bestMatches: 'Mejores matches',
    filter: 'Filtrar',
    proposeTrade: 'Proponer cambio',
    chat: 'Chat',
    outLabel: 'Sale',
    inLabel: 'Entra',
    add: 'Agregar',
  },
  en: {
    greeting: 'Hey,',
    subtitle: 'world cup 2026',
    albumEyebrow: 'YOUR ALBUM · MI PANA 26',
    heroTitle: (name) => `You're on track, ${name}.`,
    heroTitleEm: 'on track',
    completed: 'completed',
    addAction: 'Add',
    tradeAction: 'Trade',
    missingAction: 'Wishlist',
    scanAction: 'Scan',
    teamsHeader: 'Teams',
    seeAll: 'See all',
    group: 'Group',
    cards: 'cards',
    back: 'Album',
    filterAll: 'All',
    filterOwned: 'Owned',
    filterMissing: 'Missing',
    filterDup: 'Duplicates',
    tradeTitle: 'Trade',
    nearbyCount: (n) => `${n} nearby matches`,
    tradeHeroTitle: 'Swap your duplicates.',
    tradeHeroBody: (dups, panas) => `You have ${dups} duplicates that ${panas} collectors near you want.`,
    findMatch: 'Find a match',
    bestMatches: 'Best matches',
    filter: 'Filter',
    proposeTrade: 'Propose trade',
    chat: 'Chat',
    outLabel: 'Out',
    inLabel: 'In',
    add: 'Add',
  },
};

export function t(lang, key, ...args) {
  const val = strings[lang]?.[key] ?? strings.es[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

export default strings;
```

- [ ] **Step 2: Create `src/hooks/usePersistentState.js`**

Extract from the monolith:

```js
import { useState, useEffect } from 'react';

export default function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage?.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading', key, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage?.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving', key, e);
    }
  }, [state, key]);

  return [state, setState];
}
```

- [ ] **Step 3: Create `src/data.js`**

Port teams, stadiums, sticker builder, and colors from the monolith. Add the 8-color accent rotation and mock trade data:

```js
export const MOSAIC_COLORS = [
  'var(--c-yellow)', 'var(--c-orange)', 'var(--c-red)', 'var(--c-magenta)',
  'var(--c-violet)', 'var(--c-blue)', 'var(--c-teal)', 'var(--c-green)',
];

export const TEAM_ACCENT = {
  BRA: 'var(--c-yellow)',
  ARG: 'var(--c-blue)',
  FRA: 'var(--c-red)',
  MEX: 'var(--c-green)',
  USA: 'var(--c-violet)',
  ESP: 'var(--c-orange)',
};

export const TEAMS = [
  { code: 'BRA', name: 'Brasil', group: 'G', c1: '#FFDF00', c2: '#009C3B', confed: 'CONMEBOL' },
  { code: 'ARG', name: 'Argentina', group: 'C', c1: '#75AADB', c2: '#FFFFFF', confed: 'CONMEBOL' },
  { code: 'FRA', name: 'Francia', group: 'B', c1: '#0055A4', c2: '#EF4135', confed: 'UEFA' },
  { code: 'MEX', name: 'México', group: 'A', c1: '#006847', c2: '#CE1126', confed: 'CONCACAF' },
  { code: 'USA', name: 'Estados Unidos', group: 'D', c1: '#3C3B6E', c2: '#B22234', confed: 'CONCACAF' },
  { code: 'ESP', name: 'España', group: 'J', c1: '#C60B1E', c2: '#FFC400', confed: 'UEFA' },
  { code: 'CAN', name: 'Canadá', group: 'B', c1: '#FF0000', c2: '#FFFFFF', confed: 'CONCACAF' },
  { code: 'COL', name: 'Colombia', group: 'J', c1: '#FCD116', c2: '#003893', confed: 'CONMEBOL' },
  { code: 'GER', name: 'Alemania', group: 'F', c1: '#000000', c2: '#DD0000', confed: 'UEFA' },
  { code: 'ENG', name: 'Inglaterra', group: 'A', c1: '#FFFFFF', c2: '#CF081F', confed: 'UEFA' },
  { code: 'POR', name: 'Portugal', group: 'E', c1: '#006600', c2: '#FF0000', confed: 'UEFA' },
  { code: 'NED', name: 'Países Bajos', group: 'G', c1: '#FF6600', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'URU', name: 'Uruguay', group: 'H', c1: '#5CBFEB', c2: '#FFFFFF', confed: 'CONMEBOL' },
  { code: 'CRO', name: 'Croacia', group: 'C', c1: '#FF0000', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'MAR', name: 'Marruecos', group: 'J', c1: '#C1272D', c2: '#006233', confed: 'CAF' },
  { code: 'JPN', name: 'Japón', group: 'D', c1: '#000080', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'KOR', name: 'Corea del Sur', group: 'F', c1: '#CD2E3A', c2: '#0047A0', confed: 'AFC' },
  { code: 'SEN', name: 'Senegal', group: 'K', c1: '#009639', c2: '#FDEF42', confed: 'CAF' },
  { code: 'ECU', name: 'Ecuador', group: 'K', c1: '#FFD100', c2: '#034EA2', confed: 'CONMEBOL' },
  { code: 'SUI', name: 'Suiza', group: 'H', c1: '#FF0000', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'NOR', name: 'Noruega', group: 'D', c1: '#EF2B2D', c2: '#002868', confed: 'UEFA' },
  { code: 'PAN', name: 'Panamá', group: 'I', c1: '#DA121A', c2: '#003DA5', confed: 'CONCACAF' },
  { code: 'PAR', name: 'Paraguay', group: 'L', c1: '#DA121A', c2: '#0038A8', confed: 'CONMEBOL' },
  { code: 'CUW', name: 'Curazao', group: 'F', c1: '#002B7F', c2: '#F9E814', confed: 'CONCACAF' },
  { code: 'HAI', name: 'Haití', group: 'E', c1: '#00209F', c2: '#D21034', confed: 'CONCACAF' },
  { code: 'BEL', name: 'Bélgica', group: 'L', c1: '#ED2939', c2: '#000000', confed: 'UEFA' },
  { code: 'AUT', name: 'Austria', group: 'K', c1: '#ED2939', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'SCO', name: 'Escocia', group: 'I', c1: '#003078', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'SWE', name: 'Suecia', group: 'B', c1: '#006AA7', c2: '#FECC00', confed: 'UEFA' },
  { code: 'TUR', name: 'Turquía', group: 'C', c1: '#E30A17', c2: '#FFFFFF', confed: 'UEFA' },
  { code: 'CZE', name: 'Chequia', group: 'D', c1: '#11457E', c2: '#D7141A', confed: 'UEFA' },
  { code: 'BIH', name: 'Bosnia y Herzegovina', group: 'A', c1: '#002395', c2: '#FECB00', confed: 'UEFA' },
  { code: 'ALG', name: 'Argelia', group: 'E', c1: '#006633', c2: '#FFFFFF', confed: 'CAF' },
  { code: 'CPV', name: 'Cabo Verde', group: 'F', c1: '#003893', c2: '#CF2027', confed: 'CAF' },
  { code: 'EGY', name: 'Egipto', group: 'G', c1: '#CE1126', c2: '#FFFFFF', confed: 'CAF' },
  { code: 'GHA', name: 'Ghana', group: 'H', c1: '#006B3F', c2: '#FCD116', confed: 'CAF' },
  { code: 'CIV', name: 'Costa de Marfil', group: 'I', c1: '#FF8200', c2: '#009A44', confed: 'CAF' },
  { code: 'RSA', name: 'Sudáfrica', group: 'L', c1: '#007749', c2: '#FFB81C', confed: 'CAF' },
  { code: 'TUN', name: 'Túnez', group: 'A', c1: '#E70013', c2: '#FFFFFF', confed: 'CAF' },
  { code: 'COD', name: 'RD del Congo', group: 'K', c1: '#007FFF', c2: '#CE1021', confed: 'CAF' },
  { code: 'AUS', name: 'Australia', group: 'B', c1: '#00843D', c2: '#FFCD00', confed: 'AFC' },
  { code: 'IRN', name: 'Irán', group: 'C', c1: '#239F40', c2: '#DA0000', confed: 'AFC' },
  { code: 'JOR', name: 'Jordania', group: 'E', c1: '#007A3D', c2: '#CE1126', confed: 'AFC' },
  { code: 'KSA', name: 'Arabia Saudita', group: 'G', c1: '#006C35', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'QAT', name: 'Catar', group: 'H', c1: '#8A1538', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'UZB', name: 'Uzbekistán', group: 'I', c1: '#1EB53A', c2: '#0099B5', confed: 'AFC' },
  { code: 'IRQ', name: 'Irak', group: 'L', c1: '#007A3D', c2: '#FFFFFF', confed: 'AFC' },
  { code: 'NZL', name: 'Nueva Zelanda', group: 'J', c1: '#000000', c2: '#FFFFFF', confed: 'OFC' },
];

export function getTeamAccent(code) {
  return TEAM_ACCENT[code] || MOSAIC_COLORS[
    TEAMS.findIndex(t => t.code === code) % MOSAIC_COLORS.length
  ];
}

export function getStickerAccent(index) {
  return MOSAIC_COLORS[index % MOSAIC_COLORS.length];
}

export function buildTeamStickers(teamCode) {
  const stickers = [];
  for (let i = 1; i <= 18; i++) {
    stickers.push({
      id: `${teamCode}-${String(i).padStart(2, '0')}`,
      code: teamCode,
      number: String(i).padStart(3, '0'),
      name: `Jugador ${String(i).padStart(2, '0')}`,
    });
  }
  return stickers;
}

export const MOCK_MATCHES = [
  {
    name: 'Andrés P.', loc: '2.4 km · cerca', score: '9 ↔ 7', avatar: '#B0263C',
    give: [['ARG', '04'], ['BRA', '12'], ['ESP', '09']],
    get: [['FRA', '05'], ['FRA', '10'], ['FRA', '08']],
  },
  {
    name: 'María G.', loc: 'online · verificada', score: '6 ↔ 6', avatar: '#1F3A8A',
    give: [['MEX', '02'], ['USA', '11']],
    get: [['ITA', '08'], ['BRA', '03']],
  },
  {
    name: 'Luis R.', loc: '18 km · mismo grupo', score: '4 ↔ 5', avatar: '#2F7A4D',
    give: [['ITA', '07']],
    get: [['POR', '10']],
  },
];
```

- [ ] **Step 4: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/i18n.js src/data.js src/hooks/usePersistentState.js
git commit -m "feat: add i18n strings, data layer, and extracted persistence hook"
```

---

### Task 3: Flag + TabBar + QuickAction + FilterChip Components

**Files:**
- Create: `src/components/Flag.jsx`
- Create: `src/components/TabBar.jsx`
- Create: `src/components/TabBar.css`
- Create: `src/components/QuickAction.jsx`
- Create: `src/components/FilterChip.jsx`

- [ ] **Step 1: Create `src/components/Flag.jsx`**

```jsx
import React from 'react';

export default function Flag({ team, size = 38, radius = 10, fontSize = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: `linear-gradient(135deg, ${team.c1} 0 50%, ${team.c2} 50% 100%)`,
      display: 'grid', placeItems: 'center',
      color: '#fff', fontWeight: 800, fontSize,
      fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    }}>
      {team.code}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/TabBar.css`**

```css
.tabbar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--paper);
  border-top: 1px solid var(--line);
  padding: 8px 8px 14px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}
.tab {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  font-size: 9.5px; font-weight: 700; color: #9a958c;
  letter-spacing: 0.02em; background: none; border: none; padding: 0;
}
.tab.on { color: var(--ink); }
.tab-dot {
  width: 24px; height: 24px; border-radius: 8px;
  background: rgba(11,14,19,0.03);
  display: grid; place-items: center; font-size: 14px;
}
.tab.on .tab-dot { background: var(--c-yellow); color: #0B0E13; }
```

- [ ] **Step 3: Create `src/components/TabBar.jsx`**

```jsx
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
        <button
          key={key}
          className={`tab ${active === key ? 'on' : ''}`}
          onClick={() => onNavigate?.(key)}
        >
          <div className="tab-dot">{glyph}</div>
          <div>{label}</div>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Create `src/components/QuickAction.jsx`**

```jsx
import React from 'react';

export default function QuickAction({ glyph, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-tile)',
        padding: '10px 6px 8px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        fontSize: '10.5px', fontWeight: 700, color: '#1a1a1a',
        fontFamily: 'var(--font-body)', cursor: 'pointer',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: color, color: '#fff', fontWeight: 800, fontSize: 16,
        display: 'grid', placeItems: 'center',
        boxShadow: 'var(--shadow-quick-icon)',
      }}>
        {glyph}
      </div>
      {label}
    </button>
  );
}
```

- [ ] **Step 5: Create `src/components/FilterChip.jsx`**

```jsx
import React from 'react';

export default function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        background: active ? 'var(--ink)' : '#fff',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        borderRadius: 'var(--r-pill)',
        padding: '7px 12px',
        fontSize: '11.5px', fontWeight: 700,
        color: active ? '#fff' : 'var(--ink)',
        fontFamily: 'var(--font-body)', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {label}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: active ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
      }}>
        {count}
      </span>
    </button>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/Flag.jsx src/components/TabBar.jsx src/components/TabBar.css src/components/QuickAction.jsx src/components/FilterChip.jsx
git commit -m "feat: add Flag, TabBar, QuickAction, and FilterChip components"
```

---

### Task 4: Sticker Component (4 States + Accent Rotation)

**Files:**
- Create: `src/components/Sticker.jsx`
- Create: `src/components/Sticker.css`

- [ ] **Step 1: Create `src/components/Sticker.css`**

```css
.sticker {
  aspect-ratio: 3 / 4;
  border-radius: var(--r-sticker);
  background: #fff;
  border: 1px solid var(--line);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sticker-top {
  flex: 1;
  display: grid;
  place-items: center;
  position: relative;
}

.sticker-silhouette {
  width: 46px; height: 46px; border-radius: 50%;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 6px 14px -6px rgba(0,0,0,0.4);
}
.sticker-silhouette::before {
  content: "";
  display: block;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(0,0,0,0.25);
  margin: 8px auto 0;
}

.sticker-num {
  position: absolute; top: 6px; left: 6px;
  font-family: var(--font-mono);
  font-size: 9px; font-weight: 700;
  padding: 2px 5px; border-radius: 5px;
}

.sticker-name {
  padding: 5px 6px 6px;
  font-size: 10px; font-weight: 700;
  text-align: center; line-height: 1.15;
  letter-spacing: -0.005em;
  border-top: 1px solid var(--line);
}

/* Owned dot */
.sticker-owned-dot {
  position: absolute; top: 6px; right: 6px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--c-yellow);
  box-shadow: inset 0 0 0 2px #fff;
}

/* Duplicate badge */
.sticker-dup-badge {
  position: absolute; bottom: 30px; right: 6px;
  background: var(--c-magenta); color: #fff;
  font-family: var(--font-mono);
  font-size: 9px; font-weight: 700;
  padding: 2px 5px; border-radius: 5px;
  letter-spacing: 0.04em;
}

/* State: owned */
.sticker.owned .sticker-num { background: var(--c-yellow); color: var(--ink); }
.sticker.owned .sticker-name { background: #fff; }

/* State: missing */
.sticker.miss .sticker-top { background: var(--paper-2) !important; }
.sticker.miss .sticker-silhouette { background: rgba(13,16,36,0.10); box-shadow: none; }
.sticker.miss .sticker-silhouette::before { background: rgba(13,16,36,0.18); }
.sticker.miss .sticker-name { color: var(--muted); }
.sticker.miss .sticker-num { background: rgba(13,16,36,0.06); color: var(--muted); }

/* State: add */
.sticker.add { border-style: dashed; border-color: var(--line-strong); background: transparent; }
.sticker.add .sticker-top { background: transparent !important; }
.sticker.add .sticker-name { color: var(--muted); border-top: 1px dashed var(--line-strong); }
.sticker-plus { font-size: 28px; font-weight: 300; color: var(--muted); }
```

- [ ] **Step 2: Create `src/components/Sticker.jsx`**

```jsx
import React from 'react';
import { getStickerAccent } from '../data.js';
import './Sticker.css';

export default function Sticker({ sticker, state, dupCount, index, addLabel = 'Agregar', onClick }) {
  const accent = getStickerAccent(index);

  if (state === 'add') {
    return (
      <div className="sticker add" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="sticker-top">
          <div className="sticker-plus">＋</div>
        </div>
        <div className="sticker-name">{addLabel}</div>
      </div>
    );
  }

  const isOwned = state === 'owned' || state === 'dup';
  const isMiss = state === 'miss';

  return (
    <div
      className={`sticker ${state}${dupCount ? ' dup' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="sticker-num">{sticker.number}</div>
      <div className="sticker-top" style={{ background: isOwned ? accent : undefined }}>
        <div className="sticker-silhouette" />
      </div>
      {isOwned && <div className="sticker-owned-dot" />}
      {dupCount && <div className="sticker-dup-badge">×{dupCount}</div>}
      <div className="sticker-name">{sticker.name}</div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sticker.jsx src/components/Sticker.css
git commit -m "feat: add Sticker component with 4 states and accent rotation"
```

---

### Task 5: Hero + TeamHero + TradeHero Components

**Files:**
- Create: `src/components/Hero.jsx`
- Create: `src/components/Hero.css`
- Create: `src/components/TeamHero.jsx`
- Create: `src/components/TeamHero.css`
- Create: `src/components/TradeHero.jsx`
- Create: `src/components/TradeHero.css`

- [ ] **Step 1: Create `src/components/Hero.css`**

```css
.hero {
  margin: 6px var(--screen-margin) 14px;
  border-radius: var(--r-hero);
  padding: var(--sp-8);
  background:
    radial-gradient(circle at 100% 0%, var(--c-yellow) 0 80px, transparent 80px),
    radial-gradient(circle at 0% 100%, var(--c-magenta) 0 90px, transparent 90px),
    radial-gradient(circle at 100% 100%, var(--c-orange) 0 70px, transparent 70px),
    linear-gradient(150deg, var(--c-violet) 0%, var(--c-blue) 60%, var(--c-teal) 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-hero);
}
.hero::before {
  content: "";
  position: absolute;
  inset: auto -40px -50px auto;
  width: 180px; height: 180px; border-radius: 50%;
  background: var(--c-red);
  mix-blend-mode: screen; opacity: 0.5; filter: blur(2px);
}
.hero > * { position: relative; z-index: 1; }
.hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
}
.hero-title {
  font-family: var(--font-display);
  font-weight: 800; font-size: 26px;
  line-height: 1.05; margin-top: 6px;
  letter-spacing: -0.01em;
}
.hero-title em { font-style: normal; color: var(--c-yellow); }
.hero-stats {
  margin-top: 14px;
  display: flex; align-items: flex-end;
  justify-content: space-between; gap: 8px;
}
.hero-big {
  font-family: var(--font-display);
  font-weight: 900; font-size: 48px;
  line-height: 1; letter-spacing: -0.02em;
}
.hero-big small {
  font-size: 18px; font-weight: 700;
  color: rgba(255,255,255,0.5); margin-left: 4px;
}
.hero-right {
  text-align: right; font-size: 11px;
  color: rgba(255,255,255,0.7);
  font-family: var(--font-mono);
}
.hero-right b {
  display: block; color: #fff;
  font-family: var(--font-body);
  font-size: 18px; font-weight: 800;
}
.hero-progress {
  margin-top: 14px; height: 8px;
  border-radius: var(--r-pill);
  background: rgba(255,255,255,0.12);
  overflow: hidden;
}
.hero-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-yellow), var(--c-orange) 45%, var(--c-magenta) 80%, var(--c-violet));
  border-radius: var(--r-pill);
  transition: width 400ms ease-out;
}
```

- [ ] **Step 2: Create `src/components/Hero.jsx`**

```jsx
import React from 'react';
import './Hero.css';

export default function Hero({ owned, total, pct, userName, eyebrow, completedLabel }) {
  return (
    <div className="hero">
      <div className="hero-eyebrow">{eyebrow}</div>
      <div className="hero-title">
        Vas <em>bien encaminado</em>,<br />{userName}.
      </div>
      <div className="hero-stats">
        <div className="hero-big">{owned}<small>/{total}</small></div>
        <div className="hero-right">
          <b>{pct}%</b>
          {completedLabel}
        </div>
      </div>
      <div className="hero-progress">
        <div className="hero-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/TeamHero.css`**

```css
.team-hero {
  margin: 10px var(--screen-margin) 12px;
  border-radius: var(--r-team-hero);
  padding: var(--sp-8);
  display: flex; align-items: center; gap: 14px;
  color: #fff;
  position: relative; overflow: hidden;
  box-shadow: var(--shadow-team-hero);
}
.team-hero::after {
  content: "";
  position: absolute; right: -30px; bottom: -40px;
  width: 140px; height: 140px; border-radius: 50%;
  background: rgba(255,255,255,0.18);
}
.team-hero-info { flex: 1; min-width: 0; }
.team-hero-name {
  font-family: var(--font-display);
  font-weight: 900; font-size: 24px;
  letter-spacing: -0.01em; line-height: 1; color: #fff;
}
.team-hero-group {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255,255,255,0.85);
}
.team-hero-ring {
  width: 54px; height: 54px; border-radius: 50%;
  flex-shrink: 0; display: grid; place-items: center;
  position: relative; z-index: 1;
}
.team-hero-ring::after {
  content: ""; position: absolute; inset: 5px;
  border-radius: 50%;
}
.team-hero-ring b {
  position: relative; z-index: 1;
  font-family: var(--font-display);
  font-weight: 800; font-size: 14px; color: #fff;
}
```

- [ ] **Step 4: Create `src/components/TeamHero.jsx`**

```jsx
import React from 'react';
import Flag from './Flag.jsx';
import { getTeamAccent } from '../data.js';
import './TeamHero.css';

export default function TeamHero({ team, pct, groupLabel, cardsLabel }) {
  const accent = getTeamAccent(team.code);

  return (
    <div className="team-hero" style={{ background: accent }}>
      <Flag team={team} size={62} radius={14} fontSize={18} />
      <div className="team-hero-info">
        <div className="team-hero-name">{team.name}</div>
        <div className="team-hero-group">{groupLabel} {team.group} · 18 {cardsLabel}</div>
      </div>
      <div
        className="team-hero-ring"
        style={{ background: `conic-gradient(#fff 0 ${pct}%, rgba(255,255,255,0.25) 0)` }}
      >
        <div className="team-hero-ring" style={{ position: 'absolute', inset: 5, background: accent }} />
        <b>{pct}%</b>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/TradeHero.css`**

```css
.trade-hero {
  margin: 8px var(--screen-margin) 12px;
  border-radius: var(--r-trade-hero);
  padding: var(--sp-8);
  background:
    radial-gradient(circle at 100% 0%, var(--c-yellow) 0 110px, transparent 110px),
    radial-gradient(circle at 100% 100%, var(--c-orange) 0 90px, transparent 90px),
    radial-gradient(circle at 0% 100%, var(--c-magenta) 0 90px, transparent 90px),
    linear-gradient(150deg, var(--c-violet) 0%, var(--c-blue) 50%, var(--c-teal) 100%);
  color: #fff;
  position: relative; overflow: hidden;
  box-shadow: var(--shadow-hero);
}
.trade-hero > * { position: relative; z-index: 1; }
.trade-hero h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px; font-weight: 900;
  letter-spacing: -0.01em; max-width: 75%;
}
.trade-hero p {
  margin: 4px 0 0;
  font-size: 12px; color: rgba(255,255,255,0.7);
  line-height: 1.4; max-width: 78%;
}
.trade-hero-pill {
  margin-top: 12px;
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--c-yellow); color: #0B0E13;
  font-weight: 800; font-size: 12px;
  padding: 8px 12px;
  border-radius: var(--r-pill);
  border: none; cursor: pointer;
  font-family: var(--font-body);
}
```

- [ ] **Step 6: Create `src/components/TradeHero.jsx`**

```jsx
import React from 'react';
import './TradeHero.css';

export default function TradeHero({ title, body, ctaLabel, onCtaClick }) {
  return (
    <div className="trade-hero">
      <h3>{title}</h3>
      <p>{body}</p>
      <button className="trade-hero-pill" onClick={onCtaClick}>
        ⇄ {ctaLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.jsx src/components/Hero.css src/components/TeamHero.jsx src/components/TeamHero.css src/components/TradeHero.jsx src/components/TradeHero.css
git commit -m "feat: add Hero, TeamHero, and TradeHero components"
```

---

### Task 6: TeamRow Component

**Files:**
- Create: `src/components/TeamRow.jsx`
- Create: `src/components/TeamRow.css`

- [ ] **Step 1: Create `src/components/TeamRow.css`**

```css
.team-row {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r-card);
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  position: relative; overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-card);
}
.team-row::before {
  content: "";
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 6px;
}
.team-row-meta { flex: 1; min-width: 0; }
.team-row-name {
  font-weight: 800; font-size: 14px;
  letter-spacing: -0.005em;
}
.team-row-sub {
  font-family: var(--font-mono);
  font-size: 10.5px; color: var(--muted);
  margin-top: 2px; letter-spacing: 0.02em;
}
.team-row-bar {
  width: 64px; height: 6px;
  border-radius: var(--r-pill);
  background: rgba(11,14,19,0.06);
  overflow: hidden; margin-top: 4px;
}
.team-row-bar-fill {
  display: block; height: 100%;
  border-radius: var(--r-pill);
}
.team-row-pct {
  font-family: var(--font-display);
  font-weight: 800; font-size: 18px;
  letter-spacing: -0.01em;
}
.team-row-pct-sign {
  font-size: 11px; color: var(--muted);
}
```

- [ ] **Step 2: Create `src/components/TeamRow.jsx`**

```jsx
import React from 'react';
import Flag from './Flag.jsx';
import { getTeamAccent } from '../data.js';
import './TeamRow.css';

export default function TeamRow({ team, owned, total, groupLabel, onClick }) {
  const accent = getTeamAccent(team.code);
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  return (
    <div className="team-row" onClick={onClick}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: accent }} />
      <Flag team={team} />
      <div className="team-row-meta">
        <div className="team-row-name">{team.name}</div>
        <div className="team-row-sub">{groupLabel} {team.group} · {owned}/{total}</div>
        <div className="team-row-bar">
          <span className="team-row-bar-fill" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="team-row-pct">{pct}<span className="team-row-pct-sign">%</span></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/TeamRow.jsx src/components/TeamRow.css
git commit -m "feat: add TeamRow component with accent color bar and progress"
```

---

### Task 7: DealSide + MatchCard Components

**Files:**
- Create: `src/components/DealSide.jsx`
- Create: `src/components/MatchCard.jsx`
- Create: `src/components/MatchCard.css`

- [ ] **Step 1: Create `src/components/DealSide.jsx`**

```jsx
import React from 'react';

const ArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v15"/><path d="M5 13l7 7 7-7"/>
  </svg>
);

const ArrowUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V5"/><path d="M5 11l7-7 7 7"/>
  </svg>
);

export default function DealSide({ direction, chips, ariaLabel }) {
  const isGive = direction === 'give';
  const color = isGive ? 'var(--c-red)' : 'var(--c-green)';
  const chipClass = isGive ? 'on' : 'on2';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr',
      alignItems: 'center', gap: 10, padding: '10px 12px',
    }}>
      <div
        aria-label={ariaLabel}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: color,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
          display: 'grid', placeItems: 'center',
        }}
      >
        {isGive ? <ArrowDown /> : <ArrowUp />}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap', alignItems: 'center', minWidth: 0 }}>
        {chips.slice(0, 2).map(([code, num], j) => (
          <div key={j} style={{
            height: 30, padding: '0 8px', borderRadius: 7,
            background: color, border: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, color: '#fff',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '9.5px', fontWeight: 800,
              letterSpacing: '0.04em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
            }}>{code}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#fff' }}>{num}</span>
          </div>
        ))}
        {chips.length > 2 && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.55)', padding: '0 2px', letterSpacing: '0.04em',
          }}>+{chips.length - 2}</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/MatchCard.css`**

```css
.match-card {
  margin: 0 var(--screen-margin) 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r-card);
  padding: 14px;
  display: flex; flex-direction: column; gap: 12px;
}
.match-top { display: flex; align-items: center; gap: 10px; }
.match-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  flex-shrink: 0; display: grid; place-items: center;
  color: #fff; font-weight: 800; font-size: 14px;
}
.match-who { flex: 1; min-width: 0; }
.match-who-name { font-weight: 800; font-size: 14px; }
.match-who-sub {
  font-family: var(--font-mono);
  font-size: 10px; color: var(--muted);
  letter-spacing: 0.02em; margin-top: 2px;
}
.match-score {
  font-family: var(--font-display);
  font-weight: 900; font-size: 20px;
  color: var(--c-green); letter-spacing: -0.01em;
  white-space: nowrap; text-align: right;
}
.match-score small {
  font-size: 10px; color: var(--muted);
  font-weight: 700; letter-spacing: 0.06em;
  display: block; text-align: right;
}
.match-deal {
  background: #0E1426; border-radius: var(--r-panel);
  position: relative; overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
}
.match-deal-divider {
  height: 1px; margin: 0 12px;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px);
}
.match-cta { display: flex; gap: 6px; }
.match-cta button {
  flex: 1; border: 0; border-radius: var(--r-button);
  padding: 10px;
  font-family: var(--font-body); font-weight: 800; font-size: 12px;
  letter-spacing: 0.02em; cursor: pointer;
}
.match-cta-primary { background: var(--ink); color: #fff; }
.match-cta-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line-strong) !important; }
```

- [ ] **Step 3: Create `src/components/MatchCard.jsx`**

```jsx
import React from 'react';
import DealSide from './DealSide.jsx';
import './MatchCard.css';

export default function MatchCard({ match, proposeLabel, chatLabel, outLabel, inLabel }) {
  return (
    <div className="match-card">
      <div className="match-top">
        <div className="match-avatar" style={{ background: match.avatar }}>{match.name[0]}</div>
        <div className="match-who">
          <div className="match-who-name">{match.name}</div>
          <div className="match-who-sub">{match.loc}</div>
        </div>
        <div className="match-score">
          {match.score}
          <small>{/* cards label passed through */}cromos</small>
        </div>
      </div>
      <div className="match-deal">
        <DealSide direction="give" chips={match.give} ariaLabel={outLabel} />
        <div className="match-deal-divider" />
        <DealSide direction="get" chips={match.get} ariaLabel={inLabel} />
      </div>
      <div className="match-cta">
        <button className="match-cta-primary">{proposeLabel}</button>
        <button className="match-cta-ghost">{chatLabel}</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/DealSide.jsx src/components/MatchCard.jsx src/components/MatchCard.css
git commit -m "feat: add DealSide and MatchCard with substitution-board metaphor"
```

---

### Task 8: AlbumOverviewScreen

**Files:**
- Create: `src/screens/AlbumOverviewScreen.jsx`

- [ ] **Step 1: Create `src/screens/AlbumOverviewScreen.jsx`**

```jsx
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

  const sortedTeams = [...teamStats].sort((a, b) => {
    const pctA = a.owned / a.total;
    const pctB = b.owned / b.total;
    return pctB - pctA;
  });

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        padding: '8px 18px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--c-blue), #3056c8)',
            color: '#fff', display: 'grid', placeItems: 'center',
            fontWeight: 800, fontSize: 14,
          }}>
            {userName?.[0] || 'D'}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.2 }}>
            {t(lang, 'greeting')} <b style={{ display: 'block', fontWeight: 800, fontSize: 15 }}>{userName}</b>
            <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {t(lang, 'subtitle')}
            </span>
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: '1px solid var(--line)',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0E13" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
          </svg>
        </div>
      </div>

      {/* Hero */}
      <Hero
        owned={totalOwned}
        total={totalStickers}
        pct={pct}
        userName={userName}
        eyebrow={t(lang, 'albumEyebrow')}
        completedLabel={t(lang, 'completed')}
      />

      {/* Quick actions */}
      <div style={{
        margin: `0 var(--screen-margin)`,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
      }}>
        <QuickAction glyph="＋" label={t(lang, 'addAction')} color="var(--c-red)" />
        <QuickAction glyph="⇄" label={t(lang, 'tradeAction')} color="var(--c-blue)" onClick={() => onNavigate?.('trade')} />
        <QuickAction glyph="◐" label={t(lang, 'missingAction')} color="var(--c-green)" />
        <QuickAction glyph="⌘" label={t(lang, 'scanAction')} color="#0B0E13" />
      </div>

      {/* Section header */}
      <div style={{
        margin: '18px 18px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{
          margin: 0, fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em',
        }}>
          {t(lang, 'teamsHeader')}
        </h3>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          {t(lang, 'seeAll')} ({TEAMS.length})
        </div>
      </div>

      {/* Team rows */}
      <div style={{ margin: '0 var(--screen-margin)', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {sortedTeams.slice(0, 8).map(({ team, owned, total }) => (
          <TeamRow
            key={team.code}
            team={team}
            owned={owned}
            total={total}
            groupLabel={t(lang, 'group')}
            onClick={() => onSelectTeam?.(team)}
          />
        ))}
      </div>

      <TabBar active="home" onNavigate={onNavigate} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/screens/AlbumOverviewScreen.jsx
git commit -m "feat: add AlbumOverviewScreen with hero, quick actions, and team list"
```

---

### Task 9: TeamDetailScreen

**Files:**
- Create: `src/screens/TeamDetailScreen.jsx`

- [ ] **Step 1: Create `src/screens/TeamDetailScreen.jsx`**

```jsx
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
    if (qty === 0) return { ...s, state: 'miss', dupCount: 0 };
    if (qty >= 2) return { ...s, state: 'dup', dupCount: qty };
    return { ...s, state: 'owned', dupCount: 0 };
  });

  const counts = {
    all: stickerStates.length,
    owned: stickerStates.filter(s => s.state === 'owned' || s.state === 'dup').length,
    miss: stickerStates.filter(s => s.state === 'miss').length,
    dup: stickerStates.filter(s => s.state === 'dup').length,
  };

  const pct = counts.all > 0 ? Math.round((counts.owned / counts.all) * 100) : 0;

  const filtered = stickerStates.filter(s => {
    if (filter === 'owned') return s.state === 'owned' || s.state === 'dup';
    if (filter === 'miss') return s.state === 'miss';
    if (filter === 'dup') return s.state === 'dup';
    return true;
  });

  const handleStickerClick = (sticker) => {
    const qty = collection[sticker.id] || 0;
    setSticker(sticker.id, qty + 1);
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Crumb */}
      <div style={{
        padding: '6px 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#fff', border: '1px solid var(--line)',
            borderRadius: 'var(--r-pill)', padding: '6px 12px',
            color: 'var(--ink)', fontWeight: 700, fontSize: 10,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.14em',
            textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            cursor: 'pointer',
          }}
        >
          ← {t(lang, 'back')}
        </button>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--muted)',
        }}>
          {String(teamIndex).padStart(2, '0')} / {TEAMS.length}
        </div>
      </div>

      {/* Team hero */}
      <TeamHero
        team={team}
        pct={pct}
        groupLabel={t(lang, 'group')}
        cardsLabel={t(lang, 'cards')}
      />

      {/* Filters */}
      <div style={{
        margin: '0 var(--screen-margin) 12px',
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2,
      }}>
        <FilterChip label={t(lang, 'filterAll')} count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label={t(lang, 'filterOwned')} count={counts.owned} active={filter === 'owned'} onClick={() => setFilter('owned')} />
        <FilterChip label={t(lang, 'filterMissing')} count={counts.miss} active={filter === 'miss'} onClick={() => setFilter('miss')} />
        <FilterChip label={t(lang, 'filterDup')} count={counts.dup} active={filter === 'dup'} onClick={() => setFilter('dup')} />
      </div>

      {/* Sticker grid */}
      <div style={{
        margin: '0 var(--screen-margin) 14px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        alignItems: 'start', flex: 1,
      }}>
        {filtered.map((s, i) => (
          <Sticker
            key={s.id}
            sticker={s}
            state={s.state}
            dupCount={s.dupCount > 1 ? s.dupCount : undefined}
            index={i}
            addLabel={t(lang, 'add')}
            onClick={() => handleStickerClick(s)}
          />
        ))}
        <Sticker state="add" index={filtered.length} addLabel={t(lang, 'add')} sticker={{}} />
      </div>

      <TabBar active="teams" onNavigate={onNavigate} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/screens/TeamDetailScreen.jsx
git commit -m "feat: add TeamDetailScreen with sticker grid, filters, and team hero"
```

---

### Task 10: TradeMatchesScreen

**Files:**
- Create: `src/screens/TradeMatchesScreen.jsx`

- [ ] **Step 1: Create `src/screens/TradeMatchesScreen.jsx`**

```jsx
import React from 'react';
import TradeHero from '../components/TradeHero.jsx';
import MatchCard from '../components/MatchCard.jsx';
import TabBar from '../components/TabBar.jsx';
import { MOCK_MATCHES } from '../data.js';
import { t } from '../i18n.js';

export default function TradeMatchesScreen({ lang, onNavigate }) {
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '8px 18px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <b style={{ display: 'block', fontSize: 18, fontFamily: 'var(--font-display)' }}>
            {t(lang, 'tradeTitle')}
          </b>
          <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {t(lang, 'nearbyCount', 12)}
          </span>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: '1px solid var(--line)',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0E13" strokeWidth="2.4" strokeLinecap="round">
            <path d="M3 6h18M6 12h12M10 18h4"/>
          </svg>
        </div>
      </div>

      {/* Trade hero */}
      <TradeHero
        title={t(lang, 'tradeHeroTitle')}
        body={t(lang, 'tradeHeroBody', 47, 23)}
        ctaLabel={t(lang, 'findMatch')}
        onCtaClick={() => { /* TODO: match search modal */ }}
      />

      {/* Section header */}
      <div style={{
        margin: '6px 18px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{
          margin: 0, fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: 18, letterSpacing: '-0.005em',
        }}>
          {t(lang, 'bestMatches')}
        </h3>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          {t(lang, 'filter')}
        </div>
      </div>

      {/* Match cards */}
      <div style={{ flex: 1 }}>
        {MOCK_MATCHES.map((m, i) => (
          <MatchCard
            key={i}
            match={m}
            proposeLabel={t(lang, 'proposeTrade')}
            chatLabel={t(lang, 'chat')}
            outLabel={t(lang, 'outLabel')}
            inLabel={t(lang, 'inLabel')}
          />
        ))}
      </div>

      <TabBar active="trade" onNavigate={onNavigate} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/screens/TradeMatchesScreen.jsx
git commit -m "feat: add TradeMatchesScreen with hero, match cards, and deal panels"
```

---

### Task 11: App Shell + Navigation + Wire Everything

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace `src/App.jsx` with full shell**

```jsx
import React, { useState } from 'react';
import usePersistentState from './hooks/usePersistentState.js';
import AlbumOverviewScreen from './screens/AlbumOverviewScreen.jsx';
import TeamDetailScreen from './screens/TeamDetailScreen.jsx';
import TradeMatchesScreen from './screens/TradeMatchesScreen.jsx';

export default function App() {
  const [collection, setCollection] = usePersistentState('panini2026-collection', {});
  const [view, setView] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const lang = 'es';
  const userName = 'Diego';

  const setSticker = (id, qty) => {
    setCollection(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const handleNavigate = (tab) => {
    if (tab === 'home') { setView('home'); setSelectedTeam(null); }
    else if (tab === 'trade') setView('trade');
    else if (tab === 'teams') { setView('home'); setSelectedTeam(null); }
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setView('team');
  };

  if (view === 'team' && selectedTeam) {
    return (
      <TeamDetailScreen
        team={selectedTeam}
        collection={collection}
        setSticker={setSticker}
        lang={lang}
        onBack={() => { setView('home'); setSelectedTeam(null); }}
        onNavigate={handleNavigate}
      />
    );
  }

  if (view === 'trade') {
    return (
      <TradeMatchesScreen
        lang={lang}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <AlbumOverviewScreen
      collection={collection}
      lang={lang}
      userName={userName}
      onSelectTeam={handleSelectTeam}
      onNavigate={handleNavigate}
    />
  );
}
```

- [ ] **Step 2: Verify full app in browser**

Run: `npx vite dev`

Test the following:
1. Album overview loads with white background, mosaic pattern, hero card, quick actions, team rows
2. Click a team row → TeamDetailScreen shows with sticker grid
3. Click ← Álbum → returns to overview
4. Click + on a sticker → counter increments, sticker state changes
5. Filter chips work (Todos/Tengo/Faltan/Repetidos)
6. Click Trueque tab or ⇄ quick action → TradeMatchesScreen shows
7. Trade cards show substitution metaphor (red ↓ / green ↑)
8. TabBar navigation works between all screens

- [ ] **Step 3: Build for production**

Run: `npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire App shell with navigation between album, team, and trade screens"
```

---

### Task 12: Clean Up Old Monolith

**Files:**
- Delete: `src/PaniniMundial2026.jsx` (old monolith — all functionality ported to new modules)

- [ ] **Step 1: Verify old file is no longer imported**

Run: `grep -r "PaniniMundial2026" src/`
Expected: No results (main.jsx now imports App.jsx)

- [ ] **Step 2: Remove old monolith**

```bash
git rm src/PaniniMundial2026.jsx
```

- [ ] **Step 3: Final build verification**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit and push**

```bash
git commit -m "chore: remove old monolith — all functionality ported to new module structure"
git push origin main
```
