# Handoff: Mi Pana 26 — Album Redesign

## Overview
**Mi Pana 26** is a mobile-first companion app for the Panini-style FIFA World Cup 2026 sticker album. The redesign focuses on three key screens:

1. **Album overview** — progress, quick actions, team list ordered by completion
2. **Team detail** — sticker grid for one team with filters (Todos / Tengo / Faltan / Repetidos)
3. **Trueque (Trade) matches** — Tinder-style match list with explicit "give ↔ receive" cards using a referee-substitution metaphor (red ↓ goes out, green ↑ comes in)

The visual language is built directly on top of the **official FIFA World Cup 2026 sticker album cover** — a saturated 8-color mosaic of arcs and circles — so the app feels like a natural extension of the physical product.

## About the Design Files
The files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look and behavior, **not production code to copy directly**.

Your task is to **recreate these designs in the target codebase's existing environment** (React Native, SwiftUI, Flutter, Jetpack Compose, etc.) using its established patterns, component library, and routing. If no environment exists yet, choose the most appropriate framework for a mobile-first iOS+Android app and implement there.

The HTML uses React + inline JSX in a single file purely so the prototype is self-contained for review. Do not ship it.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interaction shapes are settled. Recreate pixel-perfectly using the codebase's idiomatic primitives (e.g. iOS `UIView`+Auto Layout, SwiftUI `VStack`/`HStack`, React Native `View`+Flexbox, Compose `Column`/`Row`).

The HTML simulates an iPhone (390×844 viewport). Treat that as the reference width for spacing/sizing tokens.

---

## Screens / Views

### 1. Album Overview (`AlbumOverviewScreen`)
**Purpose:** Answer at a glance — *how am I doing, what's missing, what should I do now?*

**Layout (top → bottom):**
- iOS status bar (52px reserved padding-top)
- **Top bar** (`.topbar`): avatar + greeting "Hola, **Diego**" / sub "mundial 2026 · día 142", search icon right
- **Hero progress card** (`.hero`): full-width-minus-16px-margin card, 24px radius, vibrant violet→blue→teal mosaic background. Contains:
  - Eyebrow "TU ÁLBUM · MI PANA 26"
  - Title "Vas **bien encaminado**, Diego." (yellow emphasis word)
  - Big number `419 /672` + right column `62% completado`
  - 8px progress bar with multi-stop yellow→orange→magenta→violet gradient
- **Quick actions** (`.quick`): 4-up grid of small tiles — Pegar (green +), Trueques (orange ↔), Faltan (magenta !), Cromos (yellow □). Each is white card with a 34px colored icon square + 10.5px label.
- **Section header** "Mis equipos" with `Ver todos →` link
- **Team rows** (`.team-row`): 5 rows; each is a white card with a 6px-wide left color bar (team accent), 38px diagonal-split flag, name + "GRUPO X · 16/18" subtitle, percentage right-aligned, 4px progress bar in team accent color.

### 2. Team Detail (`TeamDetailScreen`)
**Purpose:** Drill into one team — see the sticker grid, filter by state, tap a missing one to find a trade.

**Layout:**
- Status bar
- **Crumb** (`.crumb`): "← ÁLBUM" left, "03 / 48" mono counter right (jetbrains mono)
- **Team hero** (`.team-hero`): full-color card painted in the team's palette color (Brasil = yellow). 62px flag, name in Archivo Narrow Black, "GRUPO F · 18 CROMOS" subtitle. Right side: 54px conic-gradient ring showing % filled, white inner circle with bold percentage.
- **Filter chips** (`.filters`): horizontal scrollable row — Todos 18 / Tengo 14 / Faltan 3 / Repetidos 2. Active chip is dark-fill white-text.
- **Sticker grid** (`.grid`): 3-column grid, 8px gap. Each tile is 3:4 aspect ratio.
  - **Owned**: top half painted in the rotated palette accent, white silhouette portrait, yellow circle "owned dot" top-right, white name strip with yellow number badge bottom-left.
  - **Missing**: top half is `#F2F1ED` washed background, faded silhouette, muted name & number — clearly absent but still printed in slot.
  - **Duplicate**: same as owned + magenta `×N` badge above the name strip.
  - **Add slot**: dashed border, big `＋` glyph, "Agregar"/"Add" label.
- **Sticker accent rotation:** stickers cycle through the 8 mosaic colors `[yellow, orange, red, magenta, violet, blue, teal, green]` based on grid index — never paint them all the same color.

### 3. Trueque / Match List (`TradeMatchesScreen`)
**Purpose:** Find people nearby with the stickers you need who want what you have. Inspired by Tinder match feeds but with the offer fully visible on the card — no swipe-to-reveal.

**Layout:**
- Status bar
- **Header**: "Trueques" title + "12 panas cerca de ti" sub, filter icon right
- **Trade hero** (`.trade-hero`): same vibrant mosaic energy as the album-overview hero. "Cambia tus repetidos." headline + body "Tienes 47 repetidos que 23 panas cerca de ti están buscando." + yellow "Buscar un match" CTA pill.
- **Section header** "Mejores matches" + "FILTRAR" link
- **Match cards** (`.match`): white card, 18px radius. Each contains:
  - **Top row**: 36px circular avatar (initial), name + meta line ("2.4 km · cerca" / "online · verificada"), big right-aligned score `9 ↔ 7` (green) "cromos" subtitle.
  - **Deal panel** (`.deal`): dark navy `#0F1330` 14px-radius rounded panel, two stacked rows separated by a horizontal dotted line:
    - **Give row** (`.deal-side.give`): 36×36 red square with white SVG arrow ↓, then 1–3 sticker chips (red-filled `.mini-stk.on`) showing "ARG 04", "BRA 12", "+1" overflow chip.
    - **Get row** (`.deal-side.get`): 36×36 green square with white SVG arrow ↑, then 1–3 chips (green-filled), overflow.
    - The 4th-referee substitution metaphor (red goes out, green comes in) is the entire point — keep it.
  - **CTA row**: dark "Proponer cambio" primary + bordered "Chat" secondary.

---

## Interactions & Behavior

- **Tap team row** → push `TeamDetailScreen` for that team
- **Tap sticker (owned)** → bottom sheet showing acquire date, "marcar como repetido", "regalar"
- **Tap sticker (missing)** → bottom sheet "Buscar este cromo en trueques" linking into trade screen pre-filtered for that sticker
- **Tap filter chip** → re-filter grid in place; chip animates fill/text inversion
- **Tap "Buscar un match"** → opens match search modal (out of scope for this redesign, leave as TODO)
- **Tap match card "Proponer cambio"** → push trade-proposal review screen (out of scope)
- **Tap "Chat"** → push 1:1 chat
- All transitions: native push; modals slide up.
- Hero progress fill should animate width from 0 → target on first mount (400ms ease-out).
- No hover states — touch only.

## State Management

Per screen:
- `AlbumOverviewScreen` — read user profile, owned-sticker count per team, total progress
- `TeamDetailScreen` — params: `teamCode`. Load sticker[] for team, owned/missing/dup state per sticker, current filter (`all|owned|missing|dup`)
- `TradeMatchesScreen` — paginated match list, each match contains `give: Sticker[]`, `get: Sticker[]`, distance, online flag

Local UI state: filter selection, modal/sheet open flags, scroll position. Persist filter choice per team across sessions.

---

## Design Tokens

### Colors

```
/* Stage (outside the device frame) */
--bg:        #0B1020   (deep navy)
--panel:     #141A2E

/* Inside the app */
--ink:       #0D1024   (primary text)
--paper:     #FFFFFF
--paper-2:   #F2F1ED   (washed/missing-sticker background)
--line:      rgba(13,16,36,0.10)
--line-strong: rgba(13,16,36,0.22)
--muted:     #6B6E80

/* The 8 album mosaic colors — saturated, no pastels */
--c-yellow:  #FFC60B
--c-orange:  #FF6A1A
--c-red:     #E61E3C
--c-magenta: #D81E78
--c-violet:  #6E33CC
--c-blue:    #1F4FE0
--c-teal:    #00B3A4
--c-green:   #14A85E
```

**Team → palette accent mapping:**
| Team | Accent |
|---|---|
| BRA | yellow |
| ARG | blue |
| FRA | red |
| MEX | green |
| USA | violet |
| ESP | orange |

### Typography
- **Display / numerals / titles:** `Archivo Narrow` (700, 800, 900) — letter-spacing -0.01 to -0.02em
- **Body / UI:** `Archivo` (400, 500, 600, 700, 800)
- **Mono / counters / eyebrows:** `JetBrains Mono` (500, 700) — letter-spacing 0.04 to 0.14em uppercase

Sizes: hero big number 48 / title 26 / section h3 18 / team pct 18 / body 13–14 / sub 11–12 / mono eyebrow 10–11

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 32. Screen horizontal margin = 16px.

### Border radius
- Tile / chip: 6–7px
- Sticker: 12px
- Quick action / button: 12–16px
- Card / row: 18px
- Trade panel: 14px
- Hero / team-hero / trade-hero: 22–24px
- Pill / progress: 99px

### Shadows
- Card: `0 4px 10px -4px rgba(0,0,0,0.10)`
- Hero: `0 12px 32px rgba(11,16,32,0.28)`
- Team-hero: `0 8px 20px rgba(11,16,32,0.15)`
- Quick-action icon: `0 4px 10px -4px rgba(0,0,0,0.4)`

### Mosaic background pattern
Every screen has a faint mosaic background at `opacity: 0.10`, composed of 6 large radial gradients in the 8 colors. See `.scr::before` in the source. In native, recreate with a static SVG asset or a pre-rendered PNG laid behind content.

---

## Assets

- **Fonts:** Archivo, Archivo Narrow, JetBrains Mono — all Google Fonts, free for embedding.
- **Flags:** prototype uses simple 135° split of two team colors with the 3-letter code centered. In production replace with proper flag assets (FIFA-licensed) or an emoji-flag fallback.
- **Avatars / silhouettes:** placeholder circles with initials. Production should use real user photos and licensed player silhouettes/portraits per the Panini license.
- **Trophy / album illustrations:** none in the redesign — kept deliberately minimal.

## Files

- `Mi Pana Redesign.html` — the source-of-truth prototype. Contains all three screens side-by-side inside iOS frames, all CSS tokens at the top, all data inline. Open in a browser to interact.

When in doubt about a measurement, color, or copy string, **read the HTML directly** — it is canonical.

---

## Implementation Notes for Claude Code

1. **Start with the design tokens.** Lift the color, typography, spacing, and radius values into your codebase's token system (`tailwind.config`, `Theme.swift`, `colors.xml`, etc.) before building any component.
2. **Build the sticker tile first.** It's the most reused unit and exercises the full token set: 4 states (owned / missing / dup / add), accent rotation, multi-layer composition.
3. **Reuse the trade panel.** Both deal sides share structure — build one `DealSide` component with a `direction: 'give' | 'get'` prop.
4. **Localize early.** Copy is in Spanish (default) with English alternates wired through a `tw.language` flag in the prototype. Keep all strings in a single `i18n` map from day one.
5. **Mosaic backgrounds:** prefer pre-rendered images over runtime gradients on mobile — six layered radial gradients per screen will burn battery.
6. **Don't recreate the iOS frame.** The HTML wraps everything in a fake iPhone bezel for presentation only. The real app should render directly into the device viewport.
