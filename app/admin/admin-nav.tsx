"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/customers", label: admin ? "Customers & staff" : "Customers" },
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto text-sm">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 ${active ? "bg-ink text-salt" : "text-mute hover:text-ink"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
