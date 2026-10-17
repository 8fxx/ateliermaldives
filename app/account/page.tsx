import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { isStaff, requireUser } from "@/lib/auth";
import { formatPrice, orderNumber } from "@/lib/store";
import { PaymentBadge, StatusBadge, formatDate } from "@/components/order-bits";
import { logout } from "../(auth)/actions";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await db.query.orders.findMany({
    where: eq(schema.orders.userId, user.id),
    orderBy: desc(schema.orders.createdAt),
    with: { items: true },
  });

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-mute">{user.email}</p>
          <h1 className="mt-3 font-serif text-6xl">Hi, {user.name.split(" ")[0]}</h1>
        </div>
        <div className="flex gap-3">
          {isStaff(user) && (
            <Link href="/admin" className="btn-light">
              Back office
            </Link>
          )}
          <form action={logout}>
            <button className="btn-light">Sign out</button>
          </form>
        </div>
      </div>

      <h2 className="mt-14 font-serif text-3xl">Your orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-mute">
          No orders yet.{" "}
          <Link href="/shop" className="text-ink underline underline-offset-4">
            Shop the collection
          </Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 hover:bg-salt">
                <span className="font-medium">{orderNumber(o.id)}</span>
                <span className="text-sm text-mute">{formatDate(o.createdAt)}</span>
                <span className="text-sm text-mute">{o.items.reduce((n, i) => n + i.quantity, 0)} items</span>
                <span className="ml-auto flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  <PaymentBadge status={o.paymentStatus} />
                  <span className="w-20 text-right">{formatPrice(o.total)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
