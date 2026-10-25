"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart";
import { SHOP_URL, cartHref, shopHref } from "@/lib/links";

const links = [
  { href: shopHref, label: "Shop" },
  { href: "/club", label: "Run Club" },
  { href: "/plan", label: "My Plan" },
  { href: "/membership", label: "Membership" },
];

export function Header({ user }: { user: { firstName: string; staff: boolean } | null }) {
  const { count } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sand/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="font-serif text-2xl leading-none tracking-tight">
          Equa<span className="italic text-lagoon">tra</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? "text-ink" : "text-mute transition-colors hover:text-ink"}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-sm">
          {user?.staff && (
            <Link href="/admin" className="hidden text-mute hover:text-ink sm:inline">
              Back office
            </Link>
          )}
          <Link href={user ? "/account" : "/login"} className="text-mute hover:text-ink">
            {user ? user.firstName : "Sign in"}
          </Link>
          <Link href={cartHref} className="font-medium">
            {SHOP_URL ? "Bag" : `Bag (${count})`}
          </Link>
        </div>
      </div>
      <nav className="flex gap-6 overflow-x-auto border-t border-line px-4 py-2 text-sm md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "text-ink" : "text-mute"}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
