# Panini Sticker Placeholder Design

## Overview

Replace the current flat emoji+icon sticker cards with rich, Panini-style placeholder visuals using CSS pure + inline SVG. Each sticker simulates the look of a real collectible sticker with team colors, golden borders, holographic effects, and category-specific silhouettes.

Unrevealed stickers appear as if still inside the Panini packet — showing only a generic back pattern and sticker number.

## Visual States

### State 1: "En el Sobre" (qty === 0)

The sticker is face-down, showing the generic reverse side:

- **Background:** Dark blue repeating geometric pattern (`repeating-linear-gradient` crossed diagonals) simulating the classic Panini sticker backing
- **Center content:** "FIFA World Cup 2026" text, sticker number in monospace
- **Border:** 1px subtle gray (`var(--border)`)
- **No team colors or identity revealed**
- **Opacity:** Full (not dimmed — it's a real object, just face-down)

### State 2: Revealed / Owned (qty >= 1)

Full sticker face with team identity:

- **Border:** 2px golden border with inset box-shadow for bevel effect
- **Top stripe:** Team primary color band with sticker number (Bungee font, large) and diagonal flag-color accent
- **Center area:** Team color gradient background + subtle diagonal stripe pattern (`repeating-linear-gradient`). Category-specific SVG silhouette centered (white, semi-transparent)
- **Bottom bar:** Label text (player number, city, etc.) and section name
- **Paper shine:** Semi-transparent linear gradient overlay for glossy paper effect
- **Holographic effect (badge category only):** Animated `conic-gradient` that shifts on hover via CSS `@keyframes`

### State 3: Repeated (qty >= 2)

Same as revealed, plus:

- **Border color:** Upgrades to accent-3 (gold `#ffb800`)
- **Quantity badge:** Shows `x2`, `x3` etc.

## Reveal Animation (0 → 1 transition)

CSS 3D flip simulating peeling the sticker from its backing paper:

- **Technique:** `transform: rotateY()` with `backface-visibility: hidden` on a two-sided card container
- **Back face:** The "en el sobre" design
- **Front face:** The revealed sticker design
- **Duration:** 600ms `ease-in-out`
- **Trigger:** First time qty goes from 0 to 1. Controlled by a `justRevealed` state that resets after animation completes
- **Subsequent increments (1→2, 2→3):** No flip, just quantity update

## Team Colors

A `TEAM_COLORS` constant maps each team code to `{ primary, secondary }` using real jersey/flag colors. 48 entries total. Example subset:

```
ARG: { primary: '#75AADB', secondary: '#FFFFFF' }
BRA: { primary: '#CAAB2D', secondary: '#009739' }
COL: { primary: '#FCD116', secondary: '#003893' }
MEX: { primary: '#006847', secondary: '#CE1126' }
USA: { primary: '#002868', secondary: '#BF0A30' }
ENG: { primary: '#FFFFFF', secondary: '#CF081F' }
FRA: { primary: '#002395', secondary: '#ED2939' }
GER: { primary: '#000000', secondary: '#DD0000' }
ESP: { primary: '#AA151B', secondary: '#F1BF00' }
```

Special sections use a shared FIFA palette:
- Intro: `{ primary: '#1A3A5C', secondary: '#D4AF37' }`
- Legends: `{ primary: '#1C1C1C', secondary: '#D4AF37' }`
- Stadiums: `{ primary: '#1A5C3A', secondary: '#4D7CFF' }`
- Specials: `{ primary: '#2D1B69', secondary: '#D4AF37' }`

## SVG Silhouettes

Minimal inline SVG paths (no external assets). One reusable silhouette per category:

| Category | Silhouette | Description |
|----------|-----------|-------------|
| `player` | Standing footballer | Side profile, one arm raised, ball at feet |
| `badge` | Shield/crest shape | Classic heraldic shield outline |
| `team` | Group of 3 figures | Three standing silhouettes side by side |
| `stadium` | Stadium arch | Simplified stadium facade with arch roof |
| `legends` | Figure holding trophy | Silhouette lifting a cup overhead |
| `intro` | Trophy/globe | World Cup trophy silhouette |
| `special` | Star/football | Five-pointed star or football outline |

Each SVG is a single `<path>` element, rendered at ~60x60px within the card, colored white at 20-30% opacity to blend with the background gradient.

## CSS Effects Detail

### Golden Border Bevel
```css
border: 2px solid #D4AF37;
box-shadow: inset 0 0 0 1px rgba(212,175,55,0.3), 0 2px 8px rgba(0,0,0,0.3);
```

### Diagonal Stripe Pattern
```css
background-image: repeating-linear-gradient(
  45deg,
  transparent,
  transparent 8px,
  rgba(255,255,255,0.03) 8px,
  rgba(255,255,255,0.03) 16px
);
```

### Paper Shine
```css
background: linear-gradient(
  135deg,
  rgba(255,255,255,0.15) 0%,
  transparent 40%,
  transparent 60%,
  rgba(255,255,255,0.08) 100%
);
```

### Holographic (badge only)
```css
@keyframes hologram {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
/* Applied as overlay div */
background: conic-gradient(
  from 0deg,
  rgba(255,0,0,0.1),
  rgba(255,255,0,0.1),
  rgba(0,255,0,0.1),
  rgba(0,255,255,0.1),
  rgba(0,0,255,0.1),
  rgba(255,0,255,0.1),
  rgba(255,0,0,0.1)
);
background-size: 200% 200%;
animation: hologram 3s ease infinite;
mix-blend-mode: overlay;
```

### Backing Pattern (unrevealed)
```css
background:
  repeating-linear-gradient(
    45deg,
    rgba(77,124,255,0.08) 0px,
    rgba(77,124,255,0.08) 2px,
    transparent 2px,
    transparent 10px
  ),
  repeating-linear-gradient(
    -45deg,
    rgba(77,124,255,0.06) 0px,
    rgba(77,124,255,0.06) 2px,
    transparent 2px,
    transparent 10px
  ),
  #0d1220;
```

### Flip Animation
```css
.sticker-flip-container {
  perspective: 800px;
}
.sticker-flip-inner {
  transition: transform 600ms ease-in-out;
  transform-style: preserve-3d;
}
.sticker-flip-inner.flipping {
  transform: rotateY(180deg);
}
.sticker-face {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
}
.sticker-back {
  transform: rotateY(0deg);
}
.sticker-front {
  transform: rotateY(180deg);
}
```

When `flipping` class is added, back rotates to 180deg (hidden) and front rotates to 360deg (visible).

## Component Structure

The `StickerCard` component restructures to:

```
<div class="sticker-flip-container">        <!-- perspective wrapper -->
  <div class="sticker-flip-inner">           <!-- rotates on reveal -->
    <div class="sticker-back">               <!-- "en el sobre" face -->
      [backing pattern + number]
    </div>
    <div class="sticker-front">              <!-- revealed face -->
      [golden border + top stripe + silhouette + effects]
    </div>
  </div>
  <div class="sticker-controls">             <!-- always visible below -->
    [minus] [quantity] [plus]
  </div>
</div>
```

Controls remain outside the flip container so they're always accessible.

## Performance Considerations

- All effects are CSS-only (no JS animation loops)
- SVG paths are defined once as constants and referenced by category
- Holographic animation only runs on badge stickers that are owned (~48 max)
- `will-change: transform` only applied during flip transition, removed after
- No image assets loaded — zero network requests for visuals

## Scope

All changes contained within `src/PaniniMundial2026.jsx`:
- Add `TEAM_COLORS` constant (48 team entries + 4 special section palettes)
- Add `SILHOUETTES` constant (7 SVG path strings)
- Add `<style>` block with keyframes and flip classes
- Rewrite `StickerCard` component with two-face structure
- Add `justRevealed` state management for flip trigger
