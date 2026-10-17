"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "@/components/cart";

type Props = {
  product: Pick<CartItem, "slug" | "name" | "price" | "paletteBg" | "paletteFg">;
  variants: { id: number; size: string; inStock: boolean }[];
};

export function AddToBag({ product, variants }: Props) {
  const { add } = useCart();
  const available = variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState<number | null>(variants.length === 1 && available.length ? variants[0].id : null);
  const [added, setAdded] = useState(false);
  const selected = variants.find((v) => v.id === variantId);

  if (!available.length) {
    return <p className="mt-8 rounded-2xl bg-salt px-5 py-4 text-sm">Sold out. Check back soon.</p>;
  }

  return (
    <div className="mt-8">
      <p className="eyebrow text-mute">Size</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            disabled={!v.inStock}
            onClick={() => setVariantId(v.id)}
            className={`min-w-12 rounded-full border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
              variantId === v.id ? "border-ink bg-ink text-salt" : "border-line hover:border-ink"
            }`}
          >
            {v.size}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          className="btn-dark w-full sm:w-auto"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            add({ ...product, variantId: selected.id, size: selected.size });
            setAdded(true);
          }}
        >
          {selected ? "Add to bag" : "Select a size"}
        </button>
        {added && (
          <Link href="/cart" className="text-sm underline underline-offset-4">
            Added. View bag →
          </Link>
        )}
      </div>
    </div>
  );
}
