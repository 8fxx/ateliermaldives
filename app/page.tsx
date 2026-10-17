import Link from "next/link";
import { getActiveProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/store";
import { ProductArt } from "@/components/product-art";

const ticker = ["Malé dawn tempo", "Hulhumalé long run", "Addu atoll 10K", "Sunset strides", "Virtual club, island time"];

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = (await getActiveProducts()).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-salt">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,#0f6e78_0%,transparent_55%),radial-gradient(ellipse_at_10%_90%,#e8643c33_0%,transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-24 sm:px-8 md:grid-cols-12 md:pt-32">
          <div className="md:col-span-8">
            <p className="eyebrow text-salt/60">Collection 01 · Equator</p>
            <h1 className="mt-6 font-serif text-6xl leading-[0.92] tracking-tight sm:text-8xl lg:text-[8.5rem]">
              Made for <span className="italic text-coral">heat</span>,
              <br />
              salt &amp; long <span className="italic">horizons</span>.
            </h1>
            <p className="mt-8 max-w-lg text-base text-salt/70">
              Running apparel from a nation one metre above the sea, and a run club that meets wherever you are.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/shop" className="btn bg-salt text-ink hover:bg-coral hover:text-salt">
                Shop the collection
              </Link>
              <Link href="/club" className="btn border border-salt/30 hover:border-salt">
                Join the run club →
              </Link>
            </div>
          </div>
          <div className="self-end md:col-span-4">
            <div className="rounded-2xl border border-salt/15 bg-salt/5 p-6 backdrop-blur">
              <p className="eyebrow text-salt/50">This week in the club</p>
              <dl className="mt-5 grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs text-salt/50">Members</dt>
                  <dd className="font-serif text-4xl">2,418</dd>
                </div>
                <div>
                  <dt className="text-xs text-salt/50">Kilometres</dt>
                  <dd className="font-serif text-4xl">61,904</dd>
                </div>
                <div>
                  <dt className="text-xs text-salt/50">Countries</dt>
                  <dd className="font-serif text-4xl">37</dd>
                </div>
                <div>
                  <dt className="text-xs text-salt/50">Avg. humidity</dt>
                  <dd className="font-serif text-4xl">81%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden border-t border-salt/10 py-4">
          <div className="marquee flex w-max gap-12 whitespace-nowrap font-serif text-2xl italic text-salt/40">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
              <span key={i}>{t} ✺</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured merch */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-mute">The kit</p>
            <h2 className="mt-3 font-serif text-5xl">Collection 01</h2>
          </div>
          <Link href="/shop" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="group">
              <div className="transition-transform duration-500 group-hover:-translate-y-1">
                <ProductArt product={p} />
              </div>
              <div className="mt-3 flex justify-between gap-2 text-sm">
                <span>{p.name}</span>
                <span className="text-mute">{formatPrice(p.price)}</span>
              </div>
              <p className="text-xs text-mute">{p.colorway}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Run club */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-lagoon text-salt md:grid-cols-2">
          <div className="p-8 sm:p-14">
            <p className="eyebrow text-salt/60">Atelier Maldives Run Club</p>
            <h2 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">
              A club with no <span className="italic">start line</span>.
            </h2>
            <p className="mt-6 max-w-md text-salt/75">
              Join free, tell our AI coach where you are and where you&apos;re going, and get a plan built around your
              week, your heat and your goal race.
            </p>
            <Link href="/club" className="btn mt-8 bg-salt text-ink hover:bg-coral hover:text-salt">
              Join free
            </Link>
          </div>
          <ol className="grid gap-px bg-salt/15 md:grid-rows-3">
            {[
              ["01", "Join the club", "A two-minute runner profile: goal, days you can run, current volume."],
              ["02", "Get your AI plan", "Your coach writes week one free, with paces, effort cues and heat tips."],
              ["03", "Go the distance", "Atelier Pace members unlock the full plan up to race day."],
            ].map(([n, title, body]) => (
              <li key={n} className="flex gap-6 bg-lagoon p-8">
                <span className="font-serif text-3xl italic text-coral">{n}</span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-sm text-salt/65">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
