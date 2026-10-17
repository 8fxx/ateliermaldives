"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart";
import { getProduct, formatPrice } from "@/lib/products";

export default function CartPage() {
  return (
    <Suspense>
      <Cart />
    </Suspense>
  );
}

function Cart() {
  const { items, subtotal, setQuantity, clear } = useCart();
  const success = useSearchParams().get("status") === "success";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (success) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  async function checkout() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else {
      setError(data.error ?? "Checkout failed.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-6xl">Thank you.</h1>
        <p className="mt-4 text-mute">Your order is confirmed and on its way by dhoni, seaplane or courier.</p>
        <Link href="/club" className="btn-dark mt-8">
          While you wait, join the run club →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
      <h1 className="font-serif text-6xl">Bag</h1>
      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-mute">Your bag is empty.</p>
          <Link href="/shop" className="btn-dark mt-6">
            Shop the collection
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {items.map((item) => {
              const p = getProduct(item.slug)!;
              return (
                <li key={`${item.slug}-${item.size}`} className="flex items-center gap-4 py-5">
                  <div className="h-20 w-16 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                  <div className="flex-1">
                    <Link href={`/shop/${p.slug}`} className="font-medium">
                      {p.name}
                    </Link>
                    <p className="text-sm text-mute">
                      {p.colorway} · {item.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1 text-sm">
                    <button aria-label="Decrease" onClick={() => setQuantity(item.slug, item.size, item.quantity - 1)}>
                      −
                    </button>
                    <span className="w-4 text-center">{item.quantity}</span>
                    <button aria-label="Increase" onClick={() => setQuantity(item.slug, item.size, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <span className="w-20 text-right text-sm">{formatPrice(p.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-col items-end gap-4">
            <p className="text-lg">
              Subtotal <span className="ml-4">{formatPrice(subtotal)}</span>
            </p>
            <button className="btn-dark w-full sm:w-auto" onClick={checkout} disabled={loading}>
              {loading ? "Opening checkout…" : "Checkout"}
            </button>
            {error && <p className="text-sm text-coral">{error}</p>}
          </div>
        </>
      )}
    </section>
  );
}
