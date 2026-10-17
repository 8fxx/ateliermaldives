"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";
import { formatPrice } from "@/lib/store";
import { placeOrder } from "./actions";

type Props = {
  defaults: { contactName: string; contactPhone: string };
  config: { deliveryFee: number; freeDeliveryFrom: number; pickupLocation: string };
};

export function CheckoutForm({ defaults, config }: Props) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash_on_delivery">("bank_transfer");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const shipping = fulfilment === "pickup" || subtotal >= config.freeDeliveryFrom ? 0 : config.deliveryFee;

  if (!items.length) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-5xl">Your bag is empty.</h1>
        <Link href="/shop" className="btn-dark mt-8">
          Shop the collection
        </Link>
      </section>
    );
  }

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await placeOrder({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        contactName: String(formData.get("contactName") ?? ""),
        contactPhone: String(formData.get("contactPhone") ?? ""),
        fulfilment,
        island: String(formData.get("island") ?? "") || undefined,
        address: String(formData.get("address") ?? "") || undefined,
        paymentMethod,
        notes: String(formData.get("notes") ?? "") || undefined,
      });
      if (result.ok) {
        clear();
        router.push(`/account/orders/${result.orderId}?placed=1`);
      } else {
        setError(result.error);
      }
    });
  }

  const option = (active: boolean) =>
    `rounded-2xl border p-4 text-left text-sm ${active ? "border-ink bg-ink text-salt" : "border-line hover:border-ink"}`;

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-8 lg:grid-cols-5">
      <form action={submit} className="space-y-8 lg:col-span-3">
        <h1 className="font-serif text-6xl">Checkout</h1>

        <fieldset className="space-y-3">
          <legend className="eyebrow mb-3 text-mute">Contact</legend>
          <input name="contactName" required defaultValue={defaults.contactName} placeholder="Full name" className="field" />
          <input name="contactPhone" required defaultValue={defaults.contactPhone} placeholder="Phone" type="tel" className="field" />
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Delivery</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setFulfilment("delivery")} className={option(fulfilment === "delivery")}>
              <span className="block font-medium">Deliver to me</span>
              <span className="opacity-60">
                {subtotal >= config.freeDeliveryFrom ? "Free" : formatPrice(config.deliveryFee)} · free over {formatPrice(config.freeDeliveryFrom)}
              </span>
            </button>
            <button type="button" onClick={() => setFulfilment("pickup")} className={option(fulfilment === "pickup")}>
              <span className="block font-medium">Pick up</span>
              <span className="opacity-60">Free · {config.pickupLocation}</span>
            </button>
          </div>
          {fulfilment === "delivery" && (
            <div className="mt-3 space-y-3">
              <input name="island" required placeholder="Island / city (e.g. K. Malé, Hulhumalé)" className="field" />
              <textarea name="address" required rows={2} placeholder="House name, floor, street" className="field" />
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Payment</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setPaymentMethod("bank_transfer")} className={option(paymentMethod === "bank_transfer")}>
              <span className="block font-medium">Bank transfer</span>
              <span className="opacity-60">Account details shown after you order</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cash_on_delivery")}
              className={option(paymentMethod === "cash_on_delivery")}
            >
              <span className="block font-medium">Cash on {fulfilment === "pickup" ? "pickup" : "delivery"}</span>
              <span className="opacity-60">Pay when you receive your order</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-mute">Card payments are coming soon.</p>
        </fieldset>

        <textarea name="notes" rows={2} maxLength={500} placeholder="Order notes (optional)" className="field" />

        {error && <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
        <button className="btn-dark w-full" disabled={pending}>
          {pending ? "Placing order…" : `Place order · ${formatPrice(subtotal + shipping)}`}
        </button>
      </form>

      <aside className="h-fit rounded-3xl bg-salt p-6 lg:col-span-2">
        <p className="eyebrow text-mute">Your bag</p>
        <ul className="mt-4 divide-y divide-line">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {i.name} <span className="text-mute">· {i.size} × {i.quantity}</span>
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-mute">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mute">Delivery</dt>
            <dd>{shipping ? formatPrice(shipping) : "Free"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
