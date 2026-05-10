# Printable Missing List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Imprimir" button to `FullGridScreen` (visible only when `filter === 'miss'`) that prints a Letter-page-width matrix of country blocks `[CODE] num num…`, country blocks flowing horizontally and wrapping as needed, with everything else hidden during print.

**Architecture:** A new `PrintableMissingList` component is mounted inside `FullGridScreen` but hidden in `display: none` on screen; an `@media print` block flips it to `block` while hiding the rest of the document via `visibility: hidden` on the body chrome. The button calls `window.print()` directly (no app state, no preview screen). The list ordering and missing-sticker computation live in a pure helper for testability.

**Tech Stack:** React 18, Vite, Vitest, plain CSS (project uses one `.css` file per component, see `Sticker.css`, `TabBar.css`).

---

## File Structure

- **Create** `src/utils/buildPrintableMissingList.js` — pure helper that maps `(collection, teams) → [{ team, missingNums }]` ordered for printing.
- **Create** `src/utils/buildPrintableMissingList.test.js` — Vitest unit tests for the helper.
- **Create** `src/components/PrintableMissingList.jsx` — print-only React component.
- **Create** `src/components/PrintableMissingList.css` — `display: none` on screen + `@media print` rules and matrix layout.
- **Modify** `src/i18n.js` — add `print` and `missingPrintTitle` keys for `es` and `en`.
- **Modify** `src/global.css` — add reusable `.no-print` utility inside `@media print`.
- **Modify** `src/screens/FullGridScreen.jsx` — render the print button (when `filter === 'miss'`) and mount `<PrintableMissingList>`.

---

## Task 1: Pure helper `buildPrintableMissingList`

**Files:**
- Create: `src/utils/buildPrintableMissingList.js`
- Test: `src/utils/buildPrintableMissingList.test.js`

The helper takes the user's `collection` (`Record<stickerId, qty>`) and the `TEAMS` array and returns a list of `{ team, missingNums }` for countries that have at least one missing sticker, ordered by `team.group` ascending, then by `team.code` ascending. Inside each entry, `missingNums` is the list of zero-padded sticker numbers (`"01"…"20"`) that are missing.

- [ ] **Step 1.1: Write the failing tests**

Create `src/utils/buildPrintableMissingList.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { buildPrintableMissingList } from './buildPrintableMissingList.js';

const TEAMS_FIXTURE = [
  { code: 'ARG', name: 'Argentina', group: 'J' },
  { code: 'BRA', name: 'Brasil', group: 'C' },
  { code: 'MAR', name: 'Marruecos', group: 'C' },
];
const STICKERS_PER_TEAM = 5;

describe('buildPrintableMissingList', () => {
  it('returns an empty list when nothing is missing', () => {
    const collection = {};
    for (const t of TEAMS_FIXTURE) {
      for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
        collection[`${t.code}-${String(i).padStart(2, '0')}`] = 1;
      }
    }
    expect(buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM)).toEqual([]);
  });

  it('omits countries with zero missing stickers', () => {
    const collection = { 'ARG-01': 1, 'ARG-02': 1, 'ARG-03': 1, 'ARG-04': 1, 'ARG-05': 1 };
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    expect(result.find(r => r.team.code === 'ARG')).toBeUndefined();
  });

  it('lists missing numbers as zero-padded strings in ascending order', () => {
    const collection = { 'ARG-02': 1, 'ARG-04': 2 };
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    const arg = result.find(r => r.team.code === 'ARG');
    expect(arg.missingNums).toEqual(['01', '03', '05']);
  });

  it('treats qty 0 and missing key the same way', () => {
    const collection = { 'ARG-01': 0 };
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    const arg = result.find(r => r.team.code === 'ARG');
    expect(arg.missingNums).toEqual(['01', '02', '03', '04', '05']);
  });

  it('orders results by group ascending, then by code ascending', () => {
    const collection = {};
    const result = buildPrintableMissingList(collection, TEAMS_FIXTURE, STICKERS_PER_TEAM);
    expect(result.map(r => r.team.code)).toEqual(['BRA', 'MAR', 'ARG']);
  });
});
```

- [ ] **Step 1.2: Run tests to verify they fail**

Run: `npm test -- buildPrintableMissingList`
Expected: FAIL — `Cannot find module './buildPrintableMissingList.js'` (or equivalent).

- [ ] **Step 1.3: Implement the helper**

Create `src/utils/buildPrintableMissingList.js`:

```javascript
export function buildPrintableMissingList(collection, teams, stickersPerTeam) {
  const entries = [];
  for (const team of teams) {
    const missingNums = [];
    for (let i = 1; i <= stickersPerTeam; i++) {
      const num = String(i).padStart(2, '0');
      const id = `${team.code}-${num}`;
      const qty = collection[id] || 0;
      if (qty === 0) missingNums.push(num);
    }
    if (missingNums.length > 0) {
      entries.push({ team, missingNums });
    }
  }
  return entries.sort((a, b) => {
    if (a.team.group !== b.team.group) return a.team.group.localeCompare(b.team.group);
    return a.team.code.localeCompare(b.team.code);
  });
}
```

- [ ] **Step 1.4: Run tests to verify they pass**

Run: `npm test -- buildPrintableMissingList`
Expected: PASS — 5/5 tests green.

- [ ] **Step 1.5: Commit**

```bash
git add src/utils/buildPrintableMissingList.js src/utils/buildPrintableMissingList.test.js
git commit -m "feat: add buildPrintableMissingList helper for printable missing list"
```

---

## Task 2: i18n keys `print` and `missingPrintTitle`

**Files:**
- Modify: `src/i18n.js`

- [ ] **Step 2.1: Add Spanish keys**

In `src/i18n.js`, inside the `es:` block, add (place near `proposeGiveOnly`/`proposeGetOnly` for grouping):

```javascript
    print: 'Imprimir',
    missingPrintTitle: 'Mi Pana 26 · Faltantes',
```

- [ ] **Step 2.2: Add English keys**

In `src/i18n.js`, inside the `en:` block, add the matching entries:

```javascript
    print: 'Print',
    missingPrintTitle: 'Mi Pana 26 · Missing',
```

- [ ] **Step 2.3: Smoke-check the file parses**

Run: `npm test -- --run`
Expected: All existing tests still pass (no syntax errors in i18n.js).

- [ ] **Step 2.4: Commit**

```bash
git add src/i18n.js
git commit -m "i18n: add print and missingPrintTitle keys"
```

---

## Task 3: Global `.no-print` utility

**Files:**
- Modify: `src/global.css`

- [ ] **Step 3.1: Append the print utility**

At the end of `src/global.css`, add:

```css
@media print {
  .no-print { display: none !important; }
}
```

- [ ] **Step 3.2: Commit**

```bash
git add src/global.css
git commit -m "style: add .no-print global utility for print stylesheet"
```

---

## Task 4: `PrintableMissingList` component (markup + screen-hidden CSS)

**Files:**
- Create: `src/components/PrintableMissingList.jsx`
- Create: `src/components/PrintableMissingList.css`

This component is mounted inside `FullGridScreen` but invisible on screen. The print stylesheet will reveal it in Task 5.

- [ ] **Step 4.1: Create the component**

Create `src/components/PrintableMissingList.jsx`:

```jsx
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
```

- [ ] **Step 4.2: Create the screen-hidden stylesheet (print rules added in Task 5)**

Create `src/components/PrintableMissingList.css`:

```css
.printable-missing { display: none; }

.printable-missing__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: 10pt;
  font-weight: 700;
  border-bottom: 1px solid #000;
  padding-bottom: 6px;
  margin-bottom: 10px;
  color: #000;
}

.printable-missing__title {
  font-family: var(--font-display, var(--font-body));
  font-weight: 800;
  font-size: 12pt;
  letter-spacing: -0.005em;
}

.printable-missing__matrix {
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 8px;
}

.printable-missing__country {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* Keep code + numbers together as a visual unit;
     allow internal wrapping only if a single country exceeds the page width. */
  flex-wrap: wrap;
}

.printable-missing__code {
  font-family: var(--font-mono);
  font-size: 10pt;
  font-weight: 800;
  letter-spacing: 0.04em;
  border: 1px solid #000;
  padding: 1px 4px;
  color: #000;
  background: #fff;
}

.printable-missing__num {
  font-family: var(--font-mono);
  font-size: 10pt;
  font-weight: 600;
  padding: 1px 2px;
  color: #000;
}

.printable-missing__empty {
  font-family: var(--font-mono);
  font-size: 11pt;
  color: #000;
  padding: 20px 0;
  text-align: center;
}
```

- [ ] **Step 4.3: Smoke-check that imports resolve**

Run: `npm run build`
Expected: Build succeeds (no missing-import errors). The component is not yet referenced anywhere, so it won't appear in the bundle output, but the file must compile.

If `npm run build` fails because the component isn't used yet, skip this step; Task 5 will mount it and Task 6 verifies the build.

- [ ] **Step 4.4: Commit**

```bash
git add src/components/PrintableMissingList.jsx src/components/PrintableMissingList.css
git commit -m "feat: add PrintableMissingList component (hidden on screen)"
```

---

## Task 5: Print stylesheet — reveal `.printable-missing`, hide everything else

**Files:**
- Modify: `src/components/PrintableMissingList.css`

- [ ] **Step 5.1: Append the `@media print` block**

At the end of `src/components/PrintableMissingList.css`, add:

```css
@media print {
  @page { size: letter; margin: 12mm; }

  body * { visibility: hidden; }
  .printable-missing,
  .printable-missing * { visibility: visible; }

  .printable-missing {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: #000;
    background: #fff;
  }
}
```

- [ ] **Step 5.2: Commit**

```bash
git add src/components/PrintableMissingList.css
git commit -m "style: print stylesheet for PrintableMissingList (Letter, A4 fallback)"
```

---

## Task 6: Wire button and component into `FullGridScreen`

**Files:**
- Modify: `src/screens/FullGridScreen.jsx`

- [ ] **Step 6.1: Import the new component**

At the top of `src/screens/FullGridScreen.jsx`, add the import after the existing imports:

```jsx
import PrintableMissingList from '../components/PrintableMissingList.jsx';
```

- [ ] **Step 6.2: Add the "Imprimir" button next to the missing-count line**

In `src/screens/FullGridScreen.jsx`, locate this block (around lines 61-68):

```jsx
      <div style={{ padding: '12px 16px 8px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.01em' }}>
          {t(lang, 'fullGrid')}
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.04em' }}>
          {counts.miss > 0 ? t(lang, 'missingCount', counts.miss) : t(lang, 'albumComplete')}
        </div>
      </div>
```

Replace it with:

```jsx
      <div style={{ padding: '12px 16px 8px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.01em' }}>
          {t(lang, 'fullGrid')}
        </h2>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 4,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>
            {counts.miss > 0 ? t(lang, 'missingCount', counts.miss) : t(lang, 'albumComplete')}
          </div>
          {filter === 'miss' && counts.miss > 0 && (
            <button
              className="no-print"
              onClick={() => window.print()}
              style={{
                background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)',
                padding: '6px 12px', color: 'var(--ink)', fontWeight: 700, fontSize: 10,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {t(lang, 'print')}
            </button>
          )}
        </div>
      </div>
```

- [ ] **Step 6.3: Mount the printable component at the end of the screen**

In `src/screens/FullGridScreen.jsx`, locate the closing of the screen `<div>` near the bottom — the `<TabBar … />` line followed by `</div>`. Just before `<TabBar`, add the print component so it's part of the document flow but hidden on screen:

Find:

```jsx
      <TabBar active="home" onNavigate={onNavigate} />
    </div>
```

Replace with:

```jsx
      <PrintableMissingList collection={collection} lang={lang} />

      <TabBar active="home" onNavigate={onNavigate} />
    </div>
```

- [ ] **Step 6.4: Add `no-print` to the back button and tab bar so they don't appear in the printed page chrome**

`body * { visibility: hidden; }` already hides them, but adding the class is defensive and avoids reserved space if a future change uses `display: none` instead.

Find the back button block (around lines 49-55):

```jsx
        <button onClick={onBack} style={{
          background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)',
          padding: '6px 12px', color: 'var(--ink)', fontWeight: 700, fontSize: 10,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>← {t(lang, 'back')}</button>
```

Replace with:

```jsx
        <button onClick={onBack} className="no-print" style={{
          background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)',
          padding: '6px 12px', color: 'var(--ink)', fontWeight: 700, fontSize: 10,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>← {t(lang, 'back')}</button>
```

(No need to add `no-print` to TabBar — `visibility: hidden` is enough; we keep the change scoped.)

- [ ] **Step 6.5: Smoke-check the build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6.6: Run the full test suite**

Run: `npm test`
Expected: All tests pass (existing + the helper tests from Task 1).

- [ ] **Step 6.7: Commit**

```bash
git add src/screens/FullGridScreen.jsx
git commit -m "feat: print button on missing-stickers list with hidden printable matrix"
```

---

## Task 7: Manual verification in the browser

**Files:** none (no code changes).

This task is required because print layout cannot be unit-tested. Run the dev server and confirm the feature works end-to-end.

- [ ] **Step 7.1: Start the dev server**

Run: `npm run dev`
Open the URL printed by Vite (usually `http://localhost:5173`).

- [ ] **Step 7.2: Navigate to the missing-stickers list**

In the app, open `FullGridScreen` (the "Ver todos" / album overview entry point) and click the "Faltan" filter chip.
Expected: A "Imprimir" button appears to the right of the missing-count text. The button is hidden when you click "Todos", "Tengo", or "Repetidos".

- [ ] **Step 7.3: Open the print preview**

Click "Imprimir". The browser's print dialog should appear.
Expected (in the preview pane):

- Only the matrix and the header line (`Mi Pana 26 · Faltantes  X / Y  DD/MM/YYYY`) are visible.
- No app chrome: no "← Álbum" back button, no filter chips, no TabBar at the bottom, no background gradient.
- Country blocks (e.g., `ARG 02 04 06 11 15`) flow horizontally and wrap to fill the page width, with multiple countries per row when they fit.
- Order matches the on-screen order (group ascending, then code ascending).

- [ ] **Step 7.4: Test the empty state**

Manually mark every sticker as owned (or use a fixture) so `counts.miss === 0`.
Expected: the "Imprimir" button is hidden (the `counts.miss > 0` guard removes it). The line shows "Álbum completo".

- [ ] **Step 7.5: Test the language switch**

Switch the app language to English and repeat steps 7.2–7.3.
Expected: button label is "Print", header title is "Mi Pana 26 · Missing", date format is `M/D/YYYY`.

- [ ] **Step 7.6: Document any layout bugs**

If country blocks don't wrap correctly, or if a country with all 20 missing stickers overflows the page, file the issue (or fix it inline by tweaking `flex-wrap` / `gap` values) before declaring complete. The most likely tweaks:

- If gaps look too tight or too wide on paper: adjust `column-gap` (12px) and `row-gap` (8px).
- If the code cell visually disappears: bump `border` to `2px` or add a light grey background.
- If a single very-long country bleeds off the page: confirm `flex-wrap: wrap` on `.printable-missing__country` is letting numbers wrap.

- [ ] **Step 7.7: Final commit (only if any tweak was made in 7.6)**

If you adjusted CSS values:

```bash
git add src/components/PrintableMissingList.css
git commit -m "style: tune print matrix spacing after manual test"
```

Otherwise, no commit needed — Task 6 already commits the integrated feature.

---

## Self-Review

**Spec coverage:** every section of `2026-05-10-printable-missing-list-design.md` maps to a task —

- Trigger and UI → Task 6 (button placement, `no-print`, calls `window.print()`).
- i18n keys → Task 2.
- `PrintableMissingList` component structure → Task 4.
- Layout (flex-wrap matrix, country blocks, header) → Task 4 CSS.
- `@media print` rules + `@page letter` → Task 5.
- Pure helper for missing-list calculation + tests → Task 1.
- Casos borde (empty state, very-long country) → Task 4 (empty branch) and Task 7.6 (manual check).
- Archivos afectados → File Structure section above matches one-to-one.

**Placeholder scan:** No "TBD"/"TODO" steps; every code block contains the actual code; every command shows expected output where applicable.

**Type consistency:** Helper signature `buildPrintableMissingList(collection, teams, stickersPerTeam)` is the same in tests, implementation, and component import. Component prop names (`collection`, `lang`) match the call site in `FullGridScreen`. CSS class names (`.printable-missing`, `.printable-missing__header`, `.printable-missing__matrix`, `.printable-missing__country`, `.printable-missing__code`, `.printable-missing__num`, `.printable-missing__empty`, `.no-print`) are consistent across the JSX, the screen-hidden CSS, and the print rules.
