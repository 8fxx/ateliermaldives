# Shopify store (shop.equatra.mv)

Merch is sold on Shopify. The run club, AI training plans and membership stay on the Next.js site.
The two link to each other: set `NEXT_PUBLIC_SHOP_URL` on the Next.js site and every Shop / Bag / product
link goes to Shopify (`/shop`, `/cart` and `/checkout` redirect there too).

## 1. Products
`npm run shopify:csv` writes `products.csv` from `db/seed-data.ts`. In Shopify: **Products → Import**,
pick the file. Products arrive as **drafts** with 20 in stock per size. Add photos, then set them to Active.
Handles match our slugs, so `/products/lagoon-singlet` lines up with the site's links.

Prices in the CSV are in USD. If the store currency is MVR, change them before importing
(Settings → General → Store currency).

## 2. Payments (Maldives: no Shopify Payments)
Settings → Payments → **Manual payment methods**:
- **Bank transfer**. Put the BML/MIB account name and number in the instructions and ask for the order number as the transfer reference.
- **Cash on Delivery (COD)**, for Malé/Hulhumalé delivery and pickup.

Card payments come later: the third-party "BML Payment Gateway" app, or a direct BML/MIB integration.

## 3. Shipping & pickup
- Settings → Shipping and delivery → domestic zone Maldives: **Malé area delivery $5, free over $150** (matches the old site).
- Turn on **Local pickup** at the studio in Malé.

## 4. Theme (match DESIGN.md)
Use a free theme (Horizon or Dawn). In Customize → Theme settings:

| Setting | Value |
| --- | --- |
| Background | `#f2efe8` (sand) |
| Cards / inputs | `#fbfaf7` (salt) |
| Text, primary buttons | `#121212` (ink) |
| Borders | `#dcd6ca` (line) |
| Accent / links | `#0f6e78` (lagoon) |
| Sale / badges | `#b8431f` (coral-ink. Plain coral fails contrast on light backgrounds) |
| Heading font | Instrument Serif |
| Body font | Inter Tight (or the closest offered, e.g. Inter) |
| Buttons | Pill (fully rounded) |
| Product image ratio | Portrait (4:5) |

- Header menu: Shop · **Run Club** → `https://equatra.mv/club` · **Membership** → `https://equatra.mv/membership`.
- Footer: link "Join the virtual run club" back to the main site.
- Copy follows DESIGN.md §8: no exclamation marks, no countdown timers, no fake scarcity.

## 5. Domain
Settings → Domains → connect `shop.equatra.mv` (CNAME `shop` → `shops.myshopify.com`).
The main domain stays on the Next.js host.

## 6. Staff
Settings → Users and permissions → add the retail staff with Orders and Products only.
The Next.js back office (`/admin`) is no longer used for merch once the store is live.
