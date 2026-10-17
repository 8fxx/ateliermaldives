import type { Metadata } from "next";
import Link from "next/link";
import { isMember } from "@/lib/stripe";
import { SubscribeButton } from "./subscribe-button";

export const metadata: Metadata = { title: "Membership" };

const tiers = [
  {
    name: "Club",
    price: "Free",
    blurb: "For runners finding their rhythm.",
    features: ["Run club membership", "AI coach: first week of your plan", "Pace zones & island tips", "Early access to kit drops"],
  },
  {
    name: "Atelier Pace",
    price: "$12",
    period: "/ month",
    blurb: "For runners with a goal on the calendar.",
    features: [
      "Everything in Club",
      "Full AI plan, up to 16 weeks to race day",
      "Regenerate any time your week changes",
      "Taper and race-week guidance",
    ],
    highlight: true,
  },
];

export default async function MembershipPage() {
  const member = await isMember();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
      <p className="eyebrow text-mute">Membership</p>
      <h1 className="mt-3 font-serif text-6xl leading-none">
        Train with <span className="italic text-lagoon">intent</span>.
      </h1>
      <p className="mt-4 max-w-xl text-mute">Join the club free. Upgrade when you&apos;re ready to train for something. Cancel any time.</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {tiers.map((t) => (
          <div key={t.name} className={`flex flex-col rounded-3xl p-8 ${t.highlight ? "bg-ink text-salt" : "bg-salt"}`}>
            <p className="eyebrow opacity-60">{t.name}</p>
            <p className="mt-4 font-serif text-6xl">
              {t.price}
              {t.period && <span className="ml-1 font-sans text-base opacity-60">{t.period}</span>}
            </p>
            <p className="mt-2 text-sm opacity-70">{t.blurb}</p>
            <ul className="mt-8 flex-1 space-y-3 text-sm">
              {t.features.map((f) => (
                <li key={f}>✺ {f}</li>
              ))}
            </ul>
            <div className="mt-10">
              {t.highlight ? (
                member ? (
                  <Link href="/plan" className="btn w-full bg-salt text-ink">
                    You&apos;re a member. Open your plan →
                  </Link>
                ) : (
                  <SubscribeButton />
                )
              ) : (
                <Link href="/club" className="btn-light w-full">
                  Join free
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
