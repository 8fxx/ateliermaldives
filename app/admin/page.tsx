import Link from "next/link";
import { and, asc, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatPrice, orderNumber } from "@/lib/store";
import { PaymentBadge, StatusBadge, formatDate } from "@/components/order-bits";
import { SalesChart } from "./sales-chart";

export const dynamic = "force-dynamic";

const { orders, orderItems, variants, products } = schema;
const DAY = 24 * 3600 * 1000;
// Bucket by Maldives local date (UTC+5)
const localDay = sql<string>`date(${orders.createdAt}, 'unixepoch', '+5 hours')`;

export default async function Dashboard() {
  const since30 = new Date(Date.now() - 30 * DAY);
  const since14 = new Date(Date.now() - 13 * DAY);
  const live = ne(orders.status, "cancelled");

  const [[totals], [pending], [unpaid], daily, top, lowStock, recent] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)`,
        value: sql<number>`coalesce(sum(${orders.total}), 0)`,
        paid: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`,
      })
      .from(orders)
      .where(and(live, gte(orders.createdAt, since30))),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
    db
      .select({ count: sql<number>`count(*)`, value: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(and(live, eq(orders.paymentStatus, "unpaid"))),
    db
      .select({ day: localDay, value: sql<number>`sum(${orders.total})`, count: sql<number>`count(*)` })
      .from(orders)
      .where(and(live, gte(orders.createdAt, since14)))
      .groupBy(localDay),
    db
      .select({
        name: orderItems.productName,
        units: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPrice})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(live, gte(orders.createdAt, since30)))
      .groupBy(orderItems.productName)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),
    db
      .select({ id: products.id, name: products.name, size: variants.size, stock: variants.stock })
      .from(variants)
      .innerJoin(products, eq(variants.productId, products.id))
      .where(and(eq(products.active, true), lte(variants.stock, 3)))
      .orderBy(asc(variants.stock))
      .limit(8),
    db.query.orders.findMany({ orderBy: desc(orders.createdAt), limit: 6 }),
  ]);

  // Fill missing days with zero so the chart has an even 14-day axis
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since14.getTime() + i * DAY + 5 * 3600 * 1000).toISOString().slice(0, 10);
    const hit = daily.find((r) => r.day === d);
    return { day: d, value: hit?.value ?? 0, count: hit?.count ?? 0 };
  });

  const avg = totals.count ? Math.round(totals.value / totals.count) : 0;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Paid sales · 30 days" value={formatPrice(totals.paid)} hero />
        <Tile label="Orders · 30 days" value={totals.count.toLocaleString()} sub={`${formatPrice(totals.value)} ordered`} />
        <Tile label="Average order" value={formatPrice(avg)} sub="last 30 days" />
        <Tile
          label="Needs attention"
          value={`${pending.count} pending`}
          sub={`${unpaid.count} unpaid · ${formatPrice(unpaid.value)}`}
          href="/admin/orders?status=pending"
        />
      </div>

      <div className="rounded-3xl bg-salt p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-medium">Order value per day</h2>
          <span className="text-xs text-mute">Last 14 days · excludes cancelled</span>
        </div>
        <SalesChart days={days.map((d) => ({ ...d, label: formatPrice(d.value) }))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Recent orders" href="/admin/orders" className="lg:col-span-2">
          {recent.length === 0 ? (
            <p className="text-sm text-mute">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                        {orderNumber(o.id)}
                      </Link>
                      <span className="block text-xs text-mute">{o.contactName}</span>
                    </td>
                    <td className="hidden text-mute sm:table-cell">{formatDate(o.createdAt)}</td>
                    <td className="text-right">
                      <StatusBadge status={o.status} /> <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="w-24 text-right tabular-nums">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Best sellers · 30 days">
            {top.length === 0 ? (
              <p className="text-sm text-mute">No sales yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {top.map((t) => (
                  <li key={t.name} className="flex justify-between gap-2">
                    <span>{t.name}</span>
                    <span className="text-mute tabular-nums">
                      {t.units} sold · {formatPrice(t.revenue)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
          <Panel title="Low stock" href="/admin/products">
            {lowStock.length === 0 ? (
              <p className="text-sm text-mute">Everything is well stocked.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((v) => (
                  <li key={`${v.id}-${v.size}`} className="flex justify-between gap-2">
                    <Link href={`/admin/products/${v.id}`} className="hover:underline">
                      {v.name} · {v.size}
                    </Link>
                    <span className={v.stock === 0 ? "font-medium text-coral" : "text-mute"}>
                      {v.stock === 0 ? "Sold out" : `${v.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, href, hero }: { label: string; value: string; sub?: string; href?: string; hero?: boolean }) {
  const body = (
    <div className={`h-full rounded-3xl p-6 ${hero ? "bg-ink text-salt" : "bg-salt"}`}>
      <p className="text-sm opacity-60">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-transform hover:-translate-y-0.5">
      {body}
    </Link>
  ) : (
    body
  );
}

function Panel({ title, href, className = "", children }: { title: string; href?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-3xl bg-salt p-6 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-medium">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-mute hover:text-ink">
            View all →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
