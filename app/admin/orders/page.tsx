import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { formatPrice, orderNumber, paymentMethodLabels, statusLabels } from "@/lib/store";
import { PaymentBadge, StatusBadge, formatDate } from "@/components/order-bits";

export const metadata: Metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ status?: string; q?: string; payment?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { status, q, payment } = await searchParams;
  const { orders } = schema;

  const filters: SQL[] = [];
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) filters.push(eq(orders.status, status as OrderStatus));
  if (payment === "unpaid") filters.push(eq(orders.paymentStatus, "unpaid"));
  if (q?.trim()) {
    const term = q.trim();
    const id = Number(term.replace(/^AM-/i, "")) - 1000;
    const search = or(like(orders.contactName, `%${term}%`), like(orders.contactPhone, `%${term}%`));
    filters.push(id > 0 ? or(eq(orders.id, id), search)! : search!);
  }

  const rows = await db.query.orders.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: desc(orders.createdAt),
    limit: 200,
    with: { items: true },
  });

  const tab = (label: string, params: Record<string, string>) => {
    const href = `/admin/orders${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ""}`;
    const active = (params.status ?? "") === (status ?? "") && (params.payment ?? "") === (payment ?? "");
    return (
      <Link
        key={label}
        href={href}
        className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${active ? "border-ink bg-ink text-salt" : "border-line hover:border-ink"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl">Orders</h1>
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Order #, name or phone" className="field w-64 py-2" />
          <button className="btn-light py-2">Search</button>
        </form>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tab("All", {})}
        {ORDER_STATUSES.map((s) => tab(statusLabels[s], { status: s }))}
        {tab("Unpaid", { payment: "unpaid" })}
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-mute">No orders match.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-3xl bg-salt">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-mute">
              <tr className="border-b border-line">
                <th className="p-4 font-normal">Order</th>
                <th className="p-4 font-normal">Placed</th>
                <th className="p-4 font-normal">Customer</th>
                <th className="p-4 font-normal">Fulfilment</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-sand/60">
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {orderNumber(o.id)}
                    </Link>
                    <span className="block text-xs text-mute">{o.items.reduce((n, i) => n + i.quantity, 0)} items</span>
                  </td>
                  <td className="p-4 text-mute">{formatDate(o.createdAt)}</td>
                  <td className="p-4">
                    {o.contactName}
                    <span className="block text-xs text-mute">{o.contactPhone}</span>
                  </td>
                  <td className="p-4">
                    {o.fulfilment === "pickup" ? "Pickup" : o.island}
                    <span className="block text-xs text-mute">{paymentMethodLabels[o.paymentMethod]}</span>
                  </td>
                  <td className="space-x-1 p-4">
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                  </td>
                  <td className="p-4 text-right tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
