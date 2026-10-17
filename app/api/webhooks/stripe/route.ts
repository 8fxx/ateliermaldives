import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Point a Stripe webhook at /api/webhooks/stripe. Membership status is read live from Stripe,
// so this is where you'd persist orders and members once a database is added.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      console.log(`[stripe] checkout completed: ${event.data.object.id} (${event.data.object.mode})`);
      break;
    case "customer.subscription.deleted":
      console.log(`[stripe] membership cancelled: ${event.data.object.id}`);
      break;
  }

  return NextResponse.json({ received: true });
}
