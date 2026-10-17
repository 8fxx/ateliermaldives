import { NextResponse } from "next/server";
import { getStripe, siteUrl } from "@/lib/stripe";

export async function POST() {
  const stripe = getStripe();
  const price = process.env.STRIPE_MEMBERSHIP_PRICE_ID;
  if (!stripe || !price || price === "price_...") {
    return NextResponse.json(
      { error: "Memberships aren't configured yet (missing STRIPE_SECRET_KEY or STRIPE_MEMBERSHIP_PRICE_ID)." },
      { status: 503 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${siteUrl()}/api/membership/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/membership`,
  });

  return NextResponse.json({ url: session.url });
}
