import { NextResponse } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/products";
import { getStripe, siteUrl } from "@/lib/stripe";

const CartSchema = z.object({
  items: z
    .array(z.object({ slug: z.string(), size: z.string(), quantity: z.number().int().min(1).max(10) }))
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Checkout isn't configured yet (missing STRIPE_SECRET_KEY)." }, { status: 503 });
  }

  const parsed = CartSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });

  // Prices always come from the server-side catalog, never from the client.
  const lineItems = [];
  for (const item of parsed.data.items) {
    const product = getProduct(item.slug);
    if (!product || !product.sizes.includes(item.size)) {
      return NextResponse.json({ error: `Unknown item: ${item.slug}` }, { status: 400 });
    }
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: product.price,
        product_data: { name: `${product.name} (${item.size})`, description: product.colorway },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: ["MV", "US", "GB", "AU", "AE", "IN", "SG", "DE", "FR"] },
    success_url: `${siteUrl()}/cart?status=success`,
    cancel_url: `${siteUrl()}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
