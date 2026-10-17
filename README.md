# Atelier Maldives

Running apparel shop + virtual run club with AI-written training plans and a paid monthly membership.
Next.js 15 (App Router) · Tailwind v4 · Claude (`claude-opus-5-5`) · Stripe.

## Setup

```bash
cp .env.example .env.local   # fill in the keys
npm install
npm run dev                  # http://localhost:3000
```

- **Claude**: set `ANTHROPIC_API_KEY` (https://platform.claude.com).
- **Stripe**: create a product "Atelier Pace" with a recurring monthly price and put its `price_...` id in
  `STRIPE_MEMBERSHIP_PRICE_ID`. For webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- To try the full plan without Stripe, set `ATELIER_DEV_MEMBER=1` (dev only).

## How it fits together

| Route | What it does |
| --- | --- |
| `/` | Hero, featured merch, run club pitch |
| `/shop`, `/shop/[slug]` | Catalog from `lib/products.ts`; bag lives in localStorage |
| `/cart` → `POST /api/checkout` | Stripe Checkout (one-off payment); prices are taken from the server catalog |
| `/club` | Join form; saves the runner profile in the browser, then opens `/plan` |
| `/plan` → `POST /api/plan` | Claude writes the plan as structured JSON (`lib/plan.ts` schema). Free: week 1. Members: up to race day (max 16 weeks) |
| `/membership` → `POST /api/subscribe` | Stripe subscription checkout → `/api/membership/confirm` sets an httpOnly cookie with the subscription id; status is re-checked with Stripe on every plan request |
| `/api/webhooks/stripe` | Verified webhook endpoint, ready for persisting orders/members |

## Before going live

- Add accounts + a database (e.g. Auth.js/Clerk + Postgres). Profiles and plans are currently per-browser and
  the membership cookie is per-device.
- Add a Stripe customer portal link so members can cancel or update their card.
- Rate-limit `/api/plan` (each call is a paid Claude request).
- Replace `ProductArt` placeholders with product photography and the hero club stats with real numbers.
