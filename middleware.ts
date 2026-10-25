import { NextResponse, type NextRequest } from "next/server";

// When the Shopify store is live, send the old built-in shop routes there.
export function middleware(req: NextRequest) {
  const shop = process.env.NEXT_PUBLIC_SHOP_URL?.replace(/\/$/, "");
  if (!shop) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const slug = pathname.match(/^\/shop\/([^/]+)/)?.[1];
  const target = slug
    ? `${shop}/products/${slug}`
    : pathname.startsWith("/shop")
      ? `${shop}/collections/all`
      : `${shop}/cart`;
  return NextResponse.redirect(target, 308);
}

export const config = { matcher: ["/shop/:path*", "/cart", "/checkout"] };
