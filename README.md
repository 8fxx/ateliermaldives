# Atelier Maldives

Running apparel shop + virtual run club with AI-written training plans and a paid monthly membership.
Next.js 15 (App Router) · Tailwind v4 · Drizzle ORM + libSQL (SQLite) · Claude (`claude-opus-5-5`).

## Setup

```bash
cp .env.example .env.local     # fill in what you need (see below)
npm install
npm run db:migrate             # create tables in local.db
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='something-long' npm run db:seed   # products + first admin
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run db:generate` | Create a migration after editing `db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Add the starter catalog and the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (safe to re-run) |
| `npm run user:role -- <email> <customer\|staff\|admin>` | Change someone's role |
| `npm run db:studio` | Browse the database in Drizzle Studio |

## Roles

- **Customer**: signs up, orders, and sees their order history at `/account`.
- **Staff** (retail team): back office at `/admin`. Dashboard, orders (status, payment, notes), products and stock, customer list.
- **Admin** (owner): everything staff can do, plus giving or removing back-office access under *Customers & staff*.

## How it fits together

| Route | What it does |
| --- | --- |
| `/shop`, `/shop/[slug]` | Catalog from the database; sold-out sizes are disabled |
| `/cart` → `/checkout` | Sign-in required. Delivery or free pickup; bank transfer or cash on delivery. The server re-prices from the database and reserves stock in one transaction |
| `/account`, `/account/orders/[id]` | Order history; bank details shown on unpaid bank-transfer orders |
| `/admin` | Sales dashboard (paid sales, orders, average order, 14-day chart, best sellers, low stock) |
| `/admin/orders` | Filter by status / unpaid, search by order number, name or phone. Cancelling returns stock |
| `/admin/products` | Create and edit products, sizes and stock; hide products from the shop |
| `/club`, `/plan` → `POST /api/plan` | Claude writes the training plan (free: week 1; members: up to race day) |
| `/membership` | Stripe subscription. **Placeholder** until the Maldives payment gateway is integrated |

## Before going live

- **Database**: create a hosted libSQL database (e.g. Turso), set `DATABASE_URL` + `DATABASE_AUTH_TOKEN`, run `npm run db:migrate`.
- **Payments**: integrate the Maldives gateway (BML / MIB) for card payments and the membership; replace the Stripe code in `lib/stripe.ts` and `app/api/{subscribe,membership,webhooks}`.
- Link memberships to user accounts (they're currently remembered per device by a cookie).
- Add password reset and order notification emails/SMS.
- Rate-limit `/api/plan` and the login form.
- Replace `ProductArt` placeholders with photography and the home page club stats with real numbers.
- Note: `dev`/`build` use webpack because Turbopack currently fails to bundle the libSQL driver.
