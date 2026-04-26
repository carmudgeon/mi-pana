# Prompt for Claude Code

Paste this as your opening message in Claude Code, with this folder attached.

---

I'm shipping a redesign of **Mi Pana 26** — a companion app for the FIFA World Cup 2026 sticker album. I have a high-fidelity HTML prototype + a full token / component spec in this folder. Your job is to implement it in this codebase.

**Read these in order before writing any code:**
1. `README.md` — overview, screens, interactions, design tokens
2. `tokens.json` — machine-readable token table
3. `components.md` — per-component specs
4. `Mi Pana Redesign.html` — source-of-truth prototype. Open it in a browser to see the real thing. When in doubt about a measurement, color, or copy string, **this file is canonical**.

**Implementation order:**
1. Lift the design tokens in `tokens.json` into the codebase's token system (Tailwind config / theme file / Compose theme / SwiftUI tokens — whichever applies).
2. Build the `Sticker` component first (4 states: owned / missing / dup / add). It's the most reused unit.
3. Build `TeamRow`, `QuickAction`, `FilterChip`, `MatchCard`, `DealSide`. Verify each in isolation.
4. Compose the three screens: `AlbumOverviewScreen`, `TeamDetailScreen`, `TradeMatchesScreen`.
5. Wire navigation between them per the README's Interactions section.

**Constraints:**
- Match the HTML's spacing and radii **exactly**. The look depends on tight, consistent geometry.
- Sticker accents must rotate through the 8 mosaic colors by index — don't paint them all the same color.
- The trade card uses a 4th-referee substitution metaphor (red ↓ goes out, green ↑ comes in). Keep that visual; do not replace with `⇄` or `↔`.
- Copy is Spanish-default with English alternates. Wire all strings through i18n from day one.
- Mosaic background pattern: prefer a static asset over runtime gradients on mobile.

**Out of scope** (leave as `// TODO`): match search modal, trade-proposal review screen, chat screen, real auth, real sticker data ingestion.

When you finish each component, show me a screenshot.
