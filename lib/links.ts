// Merch is sold on Shopify (e.g. https://shop.equatra.mv) when NEXT_PUBLIC_SHOP_URL is set.
// Without it, the built-in shop at /shop is used (local development, or before the store is live).
export const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL?.replace(/\/$/, "") || null;

export const shopHref = SHOP_URL ? `${SHOP_URL}/collections/all` : "/shop";
export const cartHref = SHOP_URL ? `${SHOP_URL}/cart` : "/cart";
// Shopify product handles match our slugs (see shopify/products.csv)
export const productHref = (slug: string) => (SHOP_URL ? `${SHOP_URL}/products/${slug}` : `/shop/${slug}`);
