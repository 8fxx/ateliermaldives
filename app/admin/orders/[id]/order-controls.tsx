"use client";

import { useActionState, useState } from "react";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/db/enums";
import { paymentLabels, statusLabels } from "@/lib/store";
import { updateOrder, type ActionState } from "../../actions";

type Props = {
  orderId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  adminNotes: string;
  fulfilment: "delivery" | "pickup";
};

export function OrderControls({ orderId, status, paymentStatus, adminNotes, fulfilment }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOrder, undefined);
  const [nextStatus, setNextStatus] = useState(status);
  const locked = status === "cancelled";
  // Pickup orders skip "out for delivery"; delivery orders skip "ready for pickup"
  const statuses = ORDER_STATUSES.filter((s) => (fulfilment === "pickup" ? s !== "shipped" : s !== "ready"));

  return (
    <form action={action} className="space-y-5 rounded-3xl bg-salt p-6">
      <input type="hidden" name="orderId" value={orderId} />
      <h2 className="font-medium">Manage order</h2>

      <label className="block">
        <span className="eyebrow text-mute">Status</span>
        <select
          name="status"
          disabled={locked}
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
          className="field mt-2"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        {locked && <input type="hidden" name="status" value="cancelled" />}
      </label>

      <label className="block">
        <span className="eyebrow text-mute">Payment</span>
        <select name="paymentStatus" defaultValue={paymentStatus} className="field mt-2">
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {paymentLabels[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="eyebrow text-mute">Internal notes</span>
        <textarea name="adminNotes" defaultValue={adminNotes} rows={3} className="field mt-2" placeholder="Only staff can see this" />
      </label>

      {nextStatus === "cancelled" && !locked && (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-xs text-coral">
          Cancelling returns the items to stock and can&apos;t be undone.
        </p>
      )}
      {state?.error && <p className="text-sm text-coral">{state.error}</p>}
      {state?.ok && <p className="text-sm text-lagoon">{state.ok}</p>}
      <button className="btn-dark w-full" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
