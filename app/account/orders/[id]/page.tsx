import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatPrice, orderNumber } from "@/lib/store";
import { OrderFacts, OrderLines, PaymentBadge, StatusBadge, formatDate } from "@/components/order-bits";

export const metadata: Metadata = { title: "Order" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await db.query.orders.findFirst({
    // Customers can only see their own orders
    where: and(eq(schema.orders.id, Number(id) || 0), eq(schema.orders.userId, user.id)),
    with: { items: true },
  });
  if (!order) notFound();

  const placed = (await searchParams).placed === "1";
  const bank = {
    name: process.env.BANK_NAME,
    accountName: process.env.BANK_ACCOUNT_NAME,
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
  };
  const showBank = order.paymentMethod === "bank_transfer" && order.paymentStatus === "unpaid" && order.status !== "cancelled";

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
      <Link href="/account" className="text-sm text-mute hover:text-ink">
        ← Your orders
      </Link>
      {placed && (
        <div className="mt-6 rounded-2xl bg-lagoon px-5 py-4 text-salt">
          <p className="font-medium">Thank you. Your order is in.</p>
          <p className="text-sm text-salt/75">We&apos;ll be in touch on {order.contactPhone} to confirm.</p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-mute">{formatDate(order.createdAt)}</p>
          <h1 className="mt-2 font-serif text-5xl">Order {orderNumber(order.id)}</h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      {showBank && (
        <div className="mt-8 rounded-3xl border border-coral/40 bg-coral/5 p-6">
          <p className="font-medium">Pay by bank transfer</p>
          <p className="mt-1 text-sm text-mute">
            Transfer {formatPrice(order.total)} and use <strong className="text-ink">{orderNumber(order.id)}</strong> as the
            reference. We&apos;ll confirm once the payment arrives.
          </p>
          {bank.accountNumber ? (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-mute">Bank</dt>
                <dd>{bank.name}</dd>
              </div>
              <div>
                <dt className="text-mute">Account name</dt>
                <dd>{bank.accountName}</dd>
              </div>
              <div>
                <dt className="text-mute">Account number</dt>
                <dd className="font-mono">{bank.accountNumber}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm">We&apos;ll send you our account details by phone.</p>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <OrderLines order={order} items={order.items} />
        <OrderFacts order={order} />
      </div>
    </section>
  );
}
