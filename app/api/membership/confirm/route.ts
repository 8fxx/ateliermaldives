import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_COOKIE, getStripe, siteUrl } from "@/lib/stripe";

// Stripe redirects here after a successful subscription checkout.
export async function GET(req: NextRequest) {
  const stripe = getStripe();
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!stripe || !sessionId) return NextResponse.redirect(`${siteUrl()}/membership`);

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (session.status !== "complete" || !subscriptionId) {
    return NextResponse.redirect(`${siteUrl()}/membership`);
  }

  const res = NextResponse.redirect(`${siteUrl()}/plan?welcome=1`);
  res.cookies.set(MEMBER_COOKIE, subscriptionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
