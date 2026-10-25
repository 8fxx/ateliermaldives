# EQUATRA — Design

How the site looks, sounds and behaves. Read this before adding a page or component.
Tokens live in `app/globals.css`; this file explains how to use them.

## 1. Brand

**EQUATRA** makes technical running apparel and runs a virtual run club from the Maldives.
The name is coined from *equator*: the Maldives sits just north of it, and the kit is made for equatorial heat.
Write it **EQUATRA** in legal and plain text, and *Equatra* in the serif wordmark.
Reference points: Satisfy, Bandit, District Vision, Tracksmith. These brands look editorial and quiet
rather than sporty and loud.

- **Feeling:** heat, salt, long horizons. Calm confidence, not hype.
- **Story:** island-made gear, tested on Malé's sea wall, for runners anywhere.
- **Never:** neon gradients, stock "fitness" photography, exclamation marks, countdown timers, fake scarcity.

## 2. Colour

| Token | Hex | Use |
| --- | --- | --- |
| `sand` | `#f2efe8` | Page background |
| `salt` | `#fbfaf7` | Cards, panels, inputs (one step lighter than the page) |
| `ink` | `#121212` | Text, primary buttons, dark sections (hero, footer, member CTA) |
| `mute` | `#6b6760` | Secondary text, labels, inactive nav |
| `line` | `#dcd6ca` | Hairline borders and dividers |
| `lagoon` | `#0f6e78` | Brand accent: links in context, "Maldives" in the wordmark, the run-club section, success states |
| `coral` | `#e8643c` | Highlight: italic accent words on dark backgrounds, "pending"/"unpaid" states, member upsell |

**Rules**
- Pages are mostly sand, salt and ink. Lagoon and coral are accents, roughly one coloured element per screen region.
- Coral is for emphasis, not decoration. Never use coral and lagoon side by side at the same weight.
- Dark sections (`bg-ink`) use `salt` text, `salt/60–75` for secondary text, and coral for the accent word.

**Contrast (WCAG)**

| Pair | Ratio | OK for |
| --- | --- | --- |
| ink on sand | 16.3 | everything |
| mute on sand / salt | 4.9 / 5.4 | body text |
| lagoon on sand | 5.2 | body text |
| salt on lagoon | 5.7 | body text |
| coral on ink | 5.6 | body text |
| **coral on sand / salt** | **2.9 / 3.2** | **large text or non-text only** |
| salt on coral | 3.2 | large/bold text only (buttons ≥ 14px medium) |

> ⚠️ **Known issue:** error messages and small badges currently use `text-coral` on light backgrounds, which
> fails AA. Add a text-safe token such as `coral-ink: #b8431f` (4.7:1 on sand, 5.2:1 on salt) and use it for
> small coral text. Keep `coral` for fills, large type and dark backgrounds.

**Product cards** have their own two-tone palette per product (`paletteBg` / `paletteFg`), set in the back
office. Pick pairs with at least 4.5:1 contrast. The product name is large, but the category label is small.

**Charts** use `#0b8fa0` for single-series bars. It's a brighter lagoon that passes the chroma and 3:1 checks
on `salt`. Don't use `lagoon` itself for chart marks, because it reads as grey at small sizes.

## 3. Typography

| Role | Face | Tailwind | Notes |
| --- | --- | --- | --- |
| Display / headings | **Instrument Serif** | `font-serif` | Large, tight leading (`leading-none` / `0.9`). Italic for the one emphasised word |
| Body / UI | **Inter Tight** | `font-sans` (default) | 14–16px body, `text-sm` for UI |
| Eyebrow labels | Inter Tight | `.eyebrow` | 11px, uppercase, `tracking-[0.22em]`, usually `text-mute` |
| Numbers in tables | Inter Tight | `tabular-nums` | Prices and counts in columns |
| Dashboard figures | Inter Tight semibold | `text-3xl font-semibold` | Never the serif for data |

**Scale (headings):** `text-8xl`–`text-[8.5rem]` hero · `text-6xl` page title · `text-5xl` section or back-office
page · `text-3xl` sub-section.

**The italic move:** each headline italicises one word, in a colour or not. Example: *Made for **heat**, salt
& long **horizons**.* Use it once or twice per headline, never on whole sentences.

## 4. Layout

- **Container:** `mx-auto max-w-7xl px-4 sm:px-8` for wide pages, `max-w-4xl` for account and cart, `max-w-md` for auth.
- **Vertical rhythm:** `py-16` page sections, `py-20`+ hero, `mt-10`/`mt-12` between blocks.
- **Grids:** product grid `grid-cols-2 lg:grid-cols-3` (shop) or `lg:grid-cols-4` (home). Forms use a 2/3 + 1/3 split (`lg:grid-cols-3`/`5`).
- **Radius:** `rounded-full` buttons and pills · `rounded-2xl` product art and small cards · `rounded-3xl` panels and feature blocks · `rounded-xl` inputs.
- **Mobile first:** everything works at 360px. The header nav moves to a scrolling row under the logo on small screens, and wide tables scroll horizontally inside their panel.

## 5. Components

Defined as Tailwind utilities in `globals.css`, or as shared components:

| Component | Where | Notes |
| --- | --- | --- |
| `.btn-dark` | primary action | ink pill → lagoon on hover. One per view |
| `.btn-light` | secondary action | outlined pill |
| `.btn` + custom colours | buttons on dark backgrounds | e.g. `bg-salt text-ink hover:bg-coral` |
| `.field` | all inputs, selects, textareas | salt fill, `line` border, ink border on focus |
| Choice tiles | goal, experience, delivery, payment | `rounded-2xl border` buttons; selected = `bg-ink text-salt` |
| Size pills | product page | `rounded-full`; sold out = disabled, `line-through`, 40% opacity |
| `ProductArt` | `components/product-art.tsx` | Typographic placeholder until photography exists. Keep the 4:5 ratio when swapping in images |
| `StatusBadge` / `PaymentBadge` | `components/order-bits.tsx` | Filled pill for order status, outlined pill for payment |
| Panels | back office, plan, checkout summary | `rounded-3xl bg-salt p-6` |
| Notices | success / error | success: `bg-lagoon text-salt`; error: `bg-coral/10` + coral-ink text |

## 6. Imagery

- **Today:** `ProductArt` cards are a flat two-tone field, the product name set in serif, and faint wave lines.
- **Photography direction (when shot):** natural light, early morning or late afternoon, sea wall, harbour, reef
  edge, sandbank. Real runners, sweat and salt, mid-stride rather than posed. Muted, slightly warm grade. No studio
  white backgrounds for hero images. Flat lays on sand-coloured paper are fine for detail shots.
- **Ratios:** product 4:5, hero full-bleed, editorial 3:2.

## 7. Motion

- Subtle only: hover lift on product cards (`-translate-y-1`, 500ms), colour transitions on buttons.
- The hero ticker (`.marquee`) is the one continuous animation, and it stops under `prefers-reduced-motion`.
- Loading states: a single spinner plus a serif italic line ("Your coach is writing your plan…").

## 8. Voice & copy

- **Short, warm, specific.** "Every piece is tested on Malé's sea wall at 31°C and 80% humidity."
- **Second person, present tense.** "Join free. Upgrade when you're ready to train for something."
- **Local texture, lightly:** dhoni, atoll, reef, monsoon, Hulhumalé, used as product names and in examples, never as a gimmick.
- **No:** exclamation marks, "crush it", "beast mode", ALL CAPS sentences, invented statistics.
- **Buttons** say what happens: "Place order · $73.00", "Join & build my plan", "Become a member".
- **Errors** say what to do next: "Only 2 left of Lagoon Singlet (M)." not "Error 409".

## 9. Back office

The back office uses the same tokens but is denser and quieter:
- No serif except page titles. Data is set in Inter Tight with `tabular-nums`.
- Dashboard: one dark hero tile (paid sales), the rest salt. One single-series chart with no legend (the title
  names the series). Hover shows the day's value and order count, and a screen-reader table holds every value.
- Tables sit inside `rounded-3xl bg-salt` panels, with hairline row dividers and `hover:bg-sand/60`.
- Destructive actions (cancel order) show a coral warning before saving. No browser `confirm()` dialogs.

## 10. Accessibility checklist

- [ ] Text meets 4.5:1 (see §2; use `coral-ink` for small coral text)
- [ ] Every input has a visible label or an `aria-label`
- [ ] Choice tiles are `<button type="button">` with visible selected state, not colour alone
- [ ] Status never relies on colour alone: badges always carry a word
- [ ] Focus is visible on all interactive elements (don't remove outlines without a replacement)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Charts have a text or table alternative
