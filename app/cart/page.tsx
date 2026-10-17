"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { formatPrice } from "@/lib/store";

export default function CartPage() {
  const { items, subtotal, setQuantity } = useCart();

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
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-4 py-5">
                <div
                  className="h-20 w-16 shrink-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${item.paletteBg}, ${item.paletteFg})` }}
                />
                <div className="flex-1">
                  <Link href={`/shop/${item.slug}`} className="font-medium">
                    {item.name}
                  </Link>
                  <p className="text-sm text-mute">Size {item.size}</p>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1 text-sm">
                  <button aria-label="Decrease" onClick={() => setQuantity(item.variantId, item.quantity - 1)}>
                    −
                  </button>
                  <span className="w-4 text-center">{item.quantity}</span>
                  <button aria-label="Increase" onClick={() => setQuantity(item.variantId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <span className="w-20 text-right text-sm">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-end gap-4">
            <p className="text-lg">
              Subtotal <span className="ml-4">{formatPrice(subtotal)}</span>
            </p>
            <Link href="/checkout" className="btn-dark w-full sm:w-auto">
              Checkout
            </Link>
            <p className="text-xs text-mute">You&apos;ll sign in or create an account at checkout.</p>
          </div>
        </>
      )}
    </section>
  );
}
