import "server-only";
import Stripe from "stripe";
import { cookies } from "next/headers";

export const MEMBER_COOKIE = "am_subscription";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_test_...")) return null;
  client ??= new Stripe(key);
  return client;
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * True when the visitor holds an active "Equatra Pace" subscription.
 * The cookie only stores the Stripe subscription id; status is always re-checked with Stripe.
 */
export async function isMember(): Promise<boolean> {
  if (process.env.EQUATRA_DEV_MEMBER === "1") return true;

  const stripe = getStripe();
  const subscriptionId = (await cookies()).get(MEMBER_COOKIE)?.value;
  if (!stripe || !subscriptionId) return false;

  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return sub.status === "active" || sub.status === "trialing";
  } catch {
    return false;
  }
}
