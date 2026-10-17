"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart";

export function AddToBag({ slug, sizes }: { slug: string; sizes: string[] }) {
  const { add } = useCart();
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-8">
      <p className="eyebrow text-mute">Size</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`min-w-12 rounded-full border px-4 py-2 text-sm transition-colors ${
              size === s ? "border-ink bg-ink text-salt" : "border-line hover:border-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          className="btn-dark w-full sm:w-auto"
          disabled={!size}
          onClick={() => {
            add({ slug, size });
            setAdded(true);
          }}
        >
          {size ? "Add to bag" : "Select a size"}
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
