import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-salt">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-4xl leading-tight">
            Run the <span className="italic text-coral">horizon</span>.
          </p>
          <p className="mt-4 max-w-sm text-sm text-salt/60">
            Technical apparel and a virtual run club, born on a 1,192-island archipelago a metre above the sea.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow text-salt/50">Shop</p>
          <Link href="/shop" className="block hover:text-coral">All products</Link>
          <Link href="/cart" className="block hover:text-coral">Bag</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow text-salt/50">Club</p>
          <Link href="/club" className="block hover:text-coral">Join the club</Link>
          <Link href="/plan" className="block hover:text-coral">AI training plan</Link>
          <Link href="/membership" className="block hover:text-coral">Membership</Link>
        </div>
      </div>
      <div className="border-t border-salt/10 px-4 py-6 text-center text-xs text-salt/40">
        © {new Date().getFullYear()} Atelier Maldives. Malé, Republic of Maldives.
      </div>
    </footer>
  );
}
