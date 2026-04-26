# Component Specs — Mi Pana 26

Each spec lists: purpose · structure · sizing · states · copy. All measurements are at iPhone reference width 390px.

---

## `Sticker` (the unit)

**Structure:** vertical card, 3:4 aspect ratio, 12px radius, 1px `--line` border.
- **Top zone** (flex: 1): solid color field, 46px white circle silhouette centered (head shape: white outer + inner 18px dark-25% dot 8px from top).
- **Number badge**: top-left of bottom strip — yellow `--c-yellow` 22×16 rounded 5px, mono 9.5px black `0D1024`, "ARG 04" format (3-letter code + 2-digit number).
- **Name strip**: bottom 30px, white background, 11px Archivo 700, truncated.
- **Owned dot**: 16px circle top-right, yellow with 2px inset white ring.

**States:**
| State | Top fill | Silhouette | Name strip | Number bg |
|---|---|---|---|---|
| `owned` | rotating mosaic accent | white 92% | white | yellow |
| `dup` | rotating mosaic accent | white 92% | white | yellow + magenta `×N` badge |
| `miss` | `#F2F1ED` | dark 10% | white | dark 6%, muted text |
| `add` | white, 2px dashed `--line-strong`, big `＋` | — | "Agregar" | — |

**Accent rotation:** `index % 8` through `[yellow, orange, red, magenta, violet, blue, teal, green]`.

---

## `TeamRow`

White card, 18px radius, 12×14 padding, 12px gap horizontal flex.
- **Left color bar**: absolutely positioned, 6px wide, full height, team accent color.
- **Flag**: 38×38, 10px radius, diagonal `linear-gradient(135deg, c1 0 50%, c2 50% 100%)`, white 800 11px Archivo Narrow code centered.
- **Meta**: name (Archivo Narrow 800 16px), sub mono 10px uppercase letter-spacing 0.14em, 4px progress bar `rgba(13,16,36,0.06)` track + accent fill.
- **Right pct**: Archivo Narrow 800 18px ink + small `%` muted.

---

## `Hero` (album overview)

Full-width-minus-32 card, 24px radius, 18px padding.
- **Background**: 4 stacked radials (yellow @ 100% 0%, magenta @ 0% 100%, orange @ 100% 100%, big red blur bottom-right) over a violet→blue→teal linear-gradient at 150°.
- **Eyebrow**: white 60% mono 10px wide-tracking "TU ÁLBUM · MI PANA 26".
- **Title**: Archivo Narrow 800 26px white, with one yellow word.
- **Numbers row** (margin-top 14):
  - Big number `419` 48px Archivo Narrow Black + small `/672` 18px white 50%.
  - Right column right-aligned: `62%` Archivo 800 18px white, `completado` mono 11px white 70%.
- **Progress bar**: 8px, `rgba(255,255,255,0.12)` track, fill is yellow→orange→magenta→violet linear-gradient.

---

## `QuickAction`

64×72 white card, 16px radius, 1px `--line`, vertical center stack 6px gap.
- **Icon square**: 34×34, 10px radius, white glyph, 4px-down-10px-blur shadow with 40% opacity.
- Icon palette: green, orange, magenta, yellow.
- **Label**: 10.5px Archivo 700 ink.

Ordered: `Pegar` / `Trueques` / `Faltan` / `Cromos`.

---

## `TeamHero` (team detail)

22px radius, 18px padding, full-color background = team accent (e.g. Brasil yellow).
- **Decorative**: 140px white-18% circle bleeding off bottom-right.
- **Flag-lg**: 62×62, 14px radius.
- **Info**: name (Archivo Narrow 900 24px white), grp (mono 10px white 85% wide-tracking).
- **Ring** (right): 54px circle, conic-gradient `white 0 PCT%, rgba(255,255,255,0.25) 0`, inner 5px-inset solid team accent disc, percentage in white Archivo Narrow 800 14px.

---

## `FilterChip`

Pill, 32px tall, 12px h-padding, white bg, 1px `--line`.
- Active: ink fill, white text.
- Label + 8px gap + count `<span class="n">` in Archivo 800 (white-15% bg-pill when inactive, white-20% when active).

---

## `MatchCard`

White, 18px radius, 14px padding, 12px gap stack.

**Top row** (flex):
- 36px circular avatar with initial (background = team-style accent for variety).
- Meta: name 14px Archivo 800 ink, sub 11px muted.
- **Score** right: `9 ↔ 7` Archivo Narrow 900 20px green `--c-green`, "cromos" mono 10px muted below.

**Deal panel** (`.deal`):
- Background `#0F1330`, 14px radius, 12px padding.
- Two `DealSide` rows separated by `border-top: 1px dashed rgba(255,255,255,0.18)` between them.

**CTA row**:
- 2 buttons, gap 8.
- Primary "Proponer cambio": dark navy `#0F1330`, white Archivo 800 12px, 12px radius, 38px tall.
- Secondary "Chat": white bg, 1px `--line` border, ink text.

---

## `DealSide`

Flex row, gap 10, align-center.
- **Label square**: 36×36, 7px radius. `give`: `--c-red`. `get`: `--c-green`. White SVG arrow centered (down for give, up for get), 18px stroke 2.5.
- **Mini chips** (`mini-stk`): 30px tall, 8px h-padding, 7px radius.
  - Default: white-6% bg, white-12% border.
  - Active (`.on`): solid red (give) or solid green (get), no border.
  - Layout: code `cc` (Archivo Narrow 800 9.5px white-60% uppercase) + number `nm` (mono 10px white).
- **Overflow** chip: same shape, "+1" mono.

---

## `TradeHero`

Same recipe as album `Hero` but with stronger orange/yellow corners — feels like a sticker pack you tear open.
- Headline 22px Archivo Narrow 900 white.
- Body 13px white 80%.
- CTA `Buscar un match`: yellow pill, ink text Archivo 800 13px, 10×16 padding, 9999 radius. Leading `↔` glyph.
