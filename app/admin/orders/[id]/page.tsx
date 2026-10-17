import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { orderNumber } from "@/lib/store";
import { OrderFacts, OrderLines, PaymentBadge, StatusBadge, formatDate } from "@/components/order-bits";
import { OrderControls } from "./order-controls";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id) || 0;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
    with: { items: true, user: { columns: { id: true, name: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-mute hover:text-ink">
        ← Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-mute">
            {formatDate(order.createdAt)} · {order.user.name} ({order.user.email})
          </p>
          <h1 className="mt-2 font-serif text-5xl">{orderNumber(order.id)}</h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <OrderLines order={order} items={order.items} />
          <OrderFacts order={order} />
        </div>
        <div className="lg:col-span-2">
          <OrderControls
            // Remount after each save so the form shows the stored values
            key={`${order.status}|${order.paymentStatus}|${order.updatedAt.getTime()}`}
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            adminNotes={order.adminNotes ?? ""}
            fulfilment={order.fulfilment}
          />
        </div>
      </div>
    </div>
  );
}
