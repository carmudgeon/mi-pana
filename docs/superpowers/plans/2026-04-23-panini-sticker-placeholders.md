# Panini Sticker Placeholder Visuals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace flat emoji+icon sticker cards with rich Panini-style placeholder visuals featuring team-colored backgrounds, golden borders, SVG silhouettes, holographic effects, and a 3D flip reveal animation.

**Architecture:** All changes in the single monolithic file `src/PaniniMundial2026.jsx`. Add data constants (colors, SVGs) at the top, CSS keyframes/classes in the existing `<style>` block, and rewrite the `StickerCard` component with a two-face flip structure. No new dependencies.

**Tech Stack:** React 18 (inline styles + CSS-in-JSX), SVG paths, CSS 3D transforms, CSS animations

---

### Task 1: Add TEAM_COLORS and SECTION_COLORS constants

**Files:**
- Modify: `src/PaniniMundial2026.jsx:65` (after TEAMS array, before STADIUMS)

- [ ] **Step 1: Add TEAM_COLORS constant**

Insert after line 65 (closing of TEAMS array), before line 67 (STADIUMS):

```javascript
const TEAM_COLORS = {
  // CONCACAF
  CAN: { primary: '#FF0000', secondary: '#FFFFFF' },
  MEX: { primary: '#006847', secondary: '#CE1126' },
  USA: { primary: '#002868', secondary: '#BF0A30' },
  JAM: { primary: '#009B3A', secondary: '#FED100' },
  CRC: { primary: '#002B7F', secondary: '#CE1126' },
  PAN: { primary: '#DA121A', secondary: '#003DA5' },
  // CONMEBOL
  ARG: { primary: '#75AADB', secondary: '#FFFFFF' },
  BRA: { primary: '#CAAB2D', secondary: '#009739' },
  URU: { primary: '#5CBFEB', secondary: '#FFFFFF' },
  COL: { primary: '#FCD116', secondary: '#003893' },
  ECU: { primary: '#FFD100', secondary: '#034EA2' },
  PAR: { primary: '#DA121A', secondary: '#0038A8' },
  // UEFA
  ENG: { primary: '#FFFFFF', secondary: '#CF081F' },
  FRA: { primary: '#002395', secondary: '#ED2939' },
  CRO: { primary: '#FF0000', secondary: '#FFFFFF' },
  NOR: { primary: '#EF2B2D', secondary: '#002868' },
  POR: { primary: '#006600', secondary: '#FF0000' },
  GER: { primary: '#000000', secondary: '#DD0000' },
  NED: { primary: '#FF6600', secondary: '#FFFFFF' },
  SUI: { primary: '#FF0000', secondary: '#FFFFFF' },
  SCO: { primary: '#003078', secondary: '#FFFFFF' },
  ESP: { primary: '#AA151B', secondary: '#F1BF00' },
  AUT: { primary: '#ED2939', secondary: '#FFFFFF' },
  BEL: { primary: '#ED2939', secondary: '#000000' },
  BIH: { primary: '#002395', secondary: '#FECB00' },
  SWE: { primary: '#006AA7', secondary: '#FECC00' },
  TUR: { primary: '#E30A17', secondary: '#FFFFFF' },
  CZE: { primary: '#11457E', secondary: '#D7141A' },
  // CAF
  ALG: { primary: '#006633', secondary: '#FFFFFF' },
  CPV: { primary: '#003893', secondary: '#CF2027' },
  EGY: { primary: '#CE1126', secondary: '#FFFFFF' },
  GHA: { primary: '#006B3F', secondary: '#FCD116' },
  CIV: { primary: '#FF8200', secondary: '#009A44' },
  MAR: { primary: '#C1272D', secondary: '#006233' },
  SEN: { primary: '#009639', secondary: '#FDEF42' },
  RSA: { primary: '#007749', secondary: '#FFB81C' },
  TUN: { primary: '#E70013', secondary: '#FFFFFF' },
  // AFC
  AUS: { primary: '#00843D', secondary: '#FFCD00' },
  IRN: { primary: '#239F40', secondary: '#DA0000' },
  JPN: { primary: '#000080', secondary: '#FFFFFF' },
  JOR: { primary: '#007A3D', secondary: '#CE1126' },
  KOR: { primary: '#CD2E3A', secondary: '#0047A0' },
  KSA: { primary: '#006C35', secondary: '#FFFFFF' },
  QAT: { primary: '#8A1538', secondary: '#FFFFFF' },
  UZB: { primary: '#1EB53A', secondary: '#0099B5' },
  // OFC
  NZL: { primary: '#000000', secondary: '#FFFFFF' },
  // Playoffs
  COD: { primary: '#007FFF', secondary: '#CE1021' },
  IRQ: { primary: '#007A3D', secondary: '#FFFFFF' },
};

const SECTION_COLORS = {
  intro:    { primary: '#1A3A5C', secondary: '#D4AF37' },
  legends:  { primary: '#1C1C1C', secondary: '#D4AF37' },
  stadium:  { primary: '#1A5C3A', secondary: '#4D7CFF' },
  special:  { primary: '#2D1B69', secondary: '#D4AF37' },
};
```

- [ ] **Step 2: Add helper function to resolve sticker colors**

Insert right after `SECTION_COLORS`:

```javascript
const getStickerColors = (sticker) => {
  if (sticker.teamCode) return TEAM_COLORS[sticker.teamCode];
  return SECTION_COLORS[sticker.category] || SECTION_COLORS.special;
};
```

- [ ] **Step 3: Verify app still loads**

Run: `cd /Users/carmudgeon/Documents/git/panini-app && npm run dev`
Expected: App loads without errors, stickers render as before (StickerCard unchanged yet).

- [ ] **Step 4: Commit**

```bash
git add src/PaniniMundial2026.jsx
git commit -m "feat: add team and section color constants for sticker visuals"
```

---

### Task 2: Add SVG silhouette paths constant

**Files:**
- Modify: `src/PaniniMundial2026.jsx` (after `getStickerColors`, before `buildAllStickers`)

- [ ] **Step 1: Add SILHOUETTES constant**

Insert after `getStickerColors`:

```javascript
const SILHOUETTES = {
  player: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-4 14h8a4 4 0 0 1 4 4v10l4 6-3 2-4-5v7l3 12h-4l-4-10-4 10h-4l3-12v-7l-4 5-3-2 4-6V26a4 4 0 0 1 4-4z"/>
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4L8 16v14c0 13.2 9.4 25.5 22 28.5 12.6-3 22-15.3 22-28.5V16L30 4zm0 6l16 9v11c0 10.2-7 19.7-16 22.2C21 49.7 14 40.2 14 30V19l16-9z"/>
    </svg>
  ),
  team: (
    <svg viewBox="0 0 80 60" width="80" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="14" r="6"/><rect x="14" y="22" width="12" height="20" rx="3"/>
      <circle cx="40" cy="10" r="7"/><rect x="33" y="19" width="14" height="24" rx="3"/>
      <circle cx="60" cy="14" r="6"/><rect x="54" y="22" width="12" height="20" rx="3"/>
    </svg>
  ),
  stadium: (
    <svg viewBox="0 0 80 60" width="80" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 50h72v4H4zM10 50V30l6-8h48l6 8v20H10zm8-4h44V32H18v14zM16 22l4-6h40l4 6H16zM24 16l2-4h28l2 4H24z"/>
    </svg>
  ),
  legends: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-4 14h8a4 4 0 0 1 4 4v8h-3v18h-2V42h-6v10h-2V32h-3v-8a4 4 0 0 1 4-4zm-8-8l4-6h2l-3 6h-3zm16 0l-4-6h-2l3 6h3zM22 6h16v2c0 2-3 4-8 4S22 10 22 8V6z"/>
    </svg>
  ),
  intro: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4l4 8h-2v6c6 0 12 4 14 10h-4c-2-4-6-6-10-6s-8 2-10 6h-4c2-6 8-10 14-10v-6h-2l4-8zM18 32h24v4c0 8-5 14-12 16-7-2-12-8-12-16v-4zm4 4v0c0 6 4 10 8 12 4-2 8-6 8-12H22z"/>
    </svg>
  ),
  special: (
    <svg viewBox="0 0 60 60" width="60" height="60" fill="white" opacity="0.2" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4l6.9 14h15.3l-12.4 9 4.7 14.5L30 32.3 15.5 41.5l4.7-14.5L7.8 18H23.1L30 4z"/>
    </svg>
  ),
};

const getSilhouette = (category) => SILHOUETTES[category] || SILHOUETTES.special;
```

- [ ] **Step 2: Verify app still loads**

Run: `npm run dev`
Expected: No errors. Stickers unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/PaniniMundial2026.jsx
git commit -m "feat: add SVG silhouette constants for sticker categories"
```

---

### Task 3: Add CSS keyframes and flip classes

**Files:**
- Modify: `src/PaniniMundial2026.jsx:248-307` (the existing `<style>` block)

- [ ] **Step 1: Add new CSS rules to the style block**

Append the following CSS inside the existing `<style>{...}</style>` template literal, right before the closing backtick+`}</style>` (after the `.fade-in` rule at ~line 306):

```css
@keyframes hologram {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.sticker-flip-container {
  perspective: 800px;
}
.sticker-flip-inner {
  position: relative;
  transition: transform 600ms ease-in-out;
  transform-style: preserve-3d;
}
.sticker-flip-inner.flipping {
  transform: rotateY(180deg);
}
.sticker-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.sticker-front {
  transform: rotateY(180deg);
}
.sticker-back {
  transform: rotateY(0deg);
}
```

- [ ] **Step 2: Remove old `.sticker-card` hover rule**

The old `.sticker-card:hover` rule (lines ~278-282) should be updated. Replace:

```css
.sticker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
```

with:

```css
.sticker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.sticker-card:hover .holo-overlay {
  opacity: 1;
}
```

- [ ] **Step 3: Verify app loads with no CSS errors**

Run: `npm run dev`
Expected: No errors. Old sticker cards still render (not yet using new classes).

- [ ] **Step 4: Commit**

```bash
git add src/PaniniMundial2026.jsx
git commit -m "feat: add CSS keyframes and flip classes for sticker animations"
```

---

### Task 4: Rewrite StickerCard with two-face flip structure

**Files:**
- Modify: `src/PaniniMundial2026.jsx:780-898` (the `StickerCard` function)

This is the core task. Replace the entire `StickerCard` function (lines 780-898) with the new two-face component.

- [ ] **Step 1: Replace the StickerCard function**

Replace lines 780-898 with:

```jsx
function StickerCard({ sticker, qty, onChange }) {
  const owned = qty >= 1;
  const repeated = qty >= 2;
  const [justRevealed, setJustRevealed] = useState(false);
  const prevQtyRef = React.useRef(qty);

  useEffect(() => {
    if (prevQtyRef.current === 0 && qty === 1) {
      setJustRevealed(true);
      const timer = setTimeout(() => setJustRevealed(false), 650);
      return () => clearTimeout(timer);
    }
    prevQtyRef.current = qty;
  }, [qty]);

  const colors = getStickerColors(sticker);

  const getLabel = () => {
    if (sticker.category === 'badge') return 'Escudo';
    if (sticker.category === 'team') return 'Plantel';
    if (sticker.category === 'player') return `Jugador #${sticker.playerNum}`;
    if (sticker.category === 'stadium') return sticker.city;
    if (sticker.category === 'legends') return `Leyenda #${sticker.number}`;
    if (sticker.category === 'intro') return `Intro #${sticker.number}`;
    return `#${sticker.number}`;
  };

  const showFront = owned || justRevealed;

  return (
    <div className="sticker-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* FLIP CONTAINER */}
      <div className="sticker-flip-container" style={{ borderRadius: 10, overflow: 'hidden' }}>
        <div
          className={`sticker-flip-inner${justRevealed ? ' flipping' : ''}`}
          style={{ minHeight: 160 }}
        >
          {/* === BACK FACE: "En el sobre" === */}
          <div
            className="sticker-face sticker-back"
            style={{
              position: showFront && !justRevealed ? 'absolute' : 'relative',
              inset: 0,
              display: showFront && !justRevealed ? 'none' : 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: 12,
              minHeight: 160,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: `
                repeating-linear-gradient(45deg, rgba(77,124,255,0.08) 0px, rgba(77,124,255,0.08) 2px, transparent 2px, transparent 10px),
                repeating-linear-gradient(-45deg, rgba(77,124,255,0.06) 0px, rgba(77,124,255,0.06) 2px, transparent 2px, transparent 10px),
                #0d1220
              `,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.2em',
              color: 'rgba(77,124,255,0.4)', textTransform: 'uppercase', textAlign: 'center',
            }}>
              FIFA World Cup
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.15em',
              color: 'rgba(212,175,55,0.5)', textTransform: 'uppercase',
            }}>
              2026
            </div>
            <div style={{
              width: 40, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
              margin: '4px 0',
            }} />
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
              color: 'rgba(245,240,232,0.2)',
            }}>
              {sticker.id}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.25em',
              color: 'rgba(77,124,255,0.3)', textTransform: 'uppercase', marginTop: 4,
            }}>
              PANINI
            </div>
          </div>

          {/* === FRONT FACE: Revealed sticker === */}
          <div
            className="sticker-face sticker-front"
            style={{
              position: !showFront ? 'absolute' : 'relative',
              inset: 0,
              display: !showFront ? 'none' : 'flex',
              flexDirection: 'column',
              minHeight: 160,
              borderRadius: 10,
              border: `2px solid ${repeated ? '#ffb800' : '#D4AF37'}`,
              boxShadow: `inset 0 0 0 1px rgba(212,175,55,0.3), 0 2px 8px rgba(0,0,0,0.3)`,
              overflow: 'hidden',
              background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.secondary}33 100%)`,
            }}
          >
            {/* Top stripe with number */}
            <div style={{
              padding: '6px 8px',
              background: colors.primary,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Diagonal flag accent */}
              <div style={{
                position: 'absolute', top: 0, right: -10, bottom: 0, width: 40,
                background: colors.secondary,
                transform: 'skewX(-20deg)',
                opacity: 0.6,
              }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 14,
                color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                position: 'relative', zIndex: 1,
              }}>
                {sticker.id}
              </div>
              {sticker.flag && (
                <div style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>{sticker.flag}</div>
              )}
            </div>

            {/* Center area with silhouette */}
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              padding: '12px 8px',
              background: `linear-gradient(180deg, ${colors.primary}44 0%, ${colors.secondary}22 100%)`,
            }}>
              {/* Diagonal stripe pattern */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)`,
                pointerEvents: 'none',
              }} />
              {/* Paper shine */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
                pointerEvents: 'none',
              }} />
              {/* Holographic overlay for badges */}
              {sticker.category === 'badge' && (
                <div
                  className="holo-overlay"
                  style={{
                    position: 'absolute', inset: 0,
                    background: `conic-gradient(from 0deg, rgba(255,0,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,255,0.1), rgba(0,0,255,0.1), rgba(255,0,255,0.1), rgba(255,0,0,0.1))`,
                    backgroundSize: '200% 200%',
                    animation: 'hologram 3s ease infinite',
                    mixBlendMode: 'overlay',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* Silhouette */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {getSilhouette(sticker.category)}
              </div>
            </div>

            {/* Bottom bar with label */}
            <div style={{
              padding: '5px 8px',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                lineHeight: 1.2,
              }}>
                {getLabel()}
              </div>
              {sticker.teamName && (
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {sticker.teamName}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS (outside flip) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '0 2px' }}>
        <button
          className="panini-btn"
          onClick={() => onChange(Math.max(0, qty - 1))}
          disabled={qty === 0}
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: qty === 0 ? 'var(--bg-3)' : 'var(--bg)',
            color: qty === 0 ? 'var(--fg-muted)' : 'var(--fg)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: qty === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Minus size={14} />
        </button>

        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700,
          fontSize: 16,
          color: repeated ? 'var(--accent-3)' : owned ? 'var(--accent-2)' : 'var(--fg-muted)',
        }}>
          {qty === 0 ? '—' : `x${qty}`}
        </div>

        <button
          className="panini-btn"
          onClick={() => onChange(qty + 1)}
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--accent-2)', color: '#000',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser — unrevealed state**

Run: `npm run dev`
Navigate to any team section. All stickers with qty=0 should show the "en el sobre" design: dark blue geometric pattern, "FIFA World Cup 2026" text, sticker ID, "PANINI" text.

- [ ] **Step 3: Verify in browser — reveal animation**

Click the + button on an unrevealed sticker. It should flip 180 degrees over 600ms, revealing the front face with team colors, golden border, SVG silhouette, and label.

- [ ] **Step 4: Verify in browser — owned and repeated states**

Add a second copy (x2). Border should change to gold (#ffb800). The silhouette, team colors, and label should all remain visible. No flip on subsequent increments.

- [ ] **Step 5: Verify in browser — badge holographic**

Navigate to a team and add the badge sticker. Hover over it. A rainbow conic-gradient overlay should animate across the card.

- [ ] **Step 6: Verify in browser — special sections**

Check Intro, Leyendas, Estadios, and Especiales sections. Each should use their respective SECTION_COLORS palette and appropriate silhouette SVG.

- [ ] **Step 7: Commit**

```bash
git add src/PaniniMundial2026.jsx
git commit -m "feat: rewrite StickerCard with Panini-style visuals and flip animation"
```

---

### Task 5: Verify edge cases and polish

**Files:**
- Modify: `src/PaniniMundial2026.jsx` (StickerCard, if adjustments needed)

- [ ] **Step 1: Test decrement back to zero**

In the browser, add a sticker (flip reveals it), then remove it (click minus). The card should return to the "en el sobre" state instantly (no reverse flip). Verify there are no animation glitches.

- [ ] **Step 2: Test rapid clicks**

Rapidly click + multiple times. Verify flip only triggers on the 0→1 transition. Subsequent clicks just update the counter. No double-flip or animation stacking.

- [ ] **Step 3: Test RepesView still works**

Navigate to "Mis Repes". The repes view uses its own card layout (not StickerCard), so it should be unaffected. Verify it still renders correctly.

- [ ] **Step 4: Test mobile responsiveness**

Open browser dev tools, switch to a mobile viewport (375px wide). Verify:
- Cards stack properly in the grid
- "En el sobre" text is readable
- Front face elements don't overflow
- Controls are tappable

- [ ] **Step 5: Test page load with existing collection**

If localStorage has saved sticker data, owned stickers should render directly as front-face (no flip on page load). Only new reveals trigger the flip.

- [ ] **Step 6: Commit any fixes**

```bash
git add src/PaniniMundial2026.jsx
git commit -m "fix: polish sticker card edge cases and responsiveness"
```
