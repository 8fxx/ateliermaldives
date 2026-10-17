import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/db/schema";
import { formatPrice, paymentLabels, paymentMethodLabels, statusLabels, PICKUP_LOCATION } from "@/lib/store";

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-coral/15 text-coral",
  confirmed: "bg-lagoon/10 text-lagoon",
  ready: "bg-lagoon/10 text-lagoon",
  shipped: "bg-lagoon/10 text-lagoon",
  delivered: "bg-ink text-salt",
  cancelled: "bg-line text-mute",
};

const paymentTone: Record<PaymentStatus, string> = {
  unpaid: "border border-coral/50 text-coral",
  paid: "border border-lagoon/50 text-lagoon",
  refunded: "border border-line text-mute",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[status]}`}>{statusLabels[status]}</span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentTone[status]}`}>
      {paymentLabels[status]}
    </span>
  );
}

export function OrderLines({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <div className="rounded-3xl bg-salt p-6">
      <ul className="divide-y divide-line">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
            <span>
              {i.productName} <span className="text-mute">· {i.size} × {i.quantity}</span>
            </span>
            <span>{formatPrice(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-1 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-mute">Subtotal</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mute">Delivery</dt>
          <dd>{order.shippingFee ? formatPrice(order.shippingFee) : "Free"}</dd>
        </div>
        <div className="flex justify-between pt-2 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function OrderFacts({ order }: { order: Order }) {
  return (
    <dl className="grid gap-4 text-sm sm:grid-cols-2">
      <div>
        <dt className="eyebrow text-mute">Contact</dt>
        <dd className="mt-1">
          {order.contactName}
          <br />
          {order.contactPhone}
        </dd>
      </div>
      <div>
        <dt className="eyebrow text-mute">{order.fulfilment === "pickup" ? "Pickup" : "Delivery"}</dt>
        <dd className="mt-1 whitespace-pre-line">
          {order.fulfilment === "pickup" ? PICKUP_LOCATION : `${order.address}\n${order.island}`}
        </dd>
      </div>
      <div>
        <dt className="eyebrow text-mute">Payment</dt>
        <dd className="mt-1">{paymentMethodLabels[order.paymentMethod]}</dd>
      </div>
      {order.notes && (
        <div>
          <dt className="eyebrow text-mute">Notes</dt>
          <dd className="mt-1">{order.notes}</dd>
        </div>
      )}
    </dl>
  );
}

export const formatDate = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Indian/Maldives" });
