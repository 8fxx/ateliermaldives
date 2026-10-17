import Link from "next/link";
import type { Metadata } from "next";
import { products, formatPrice } from "@/lib/products";
import { ProductArt } from "@/components/product-art";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <p className="eyebrow text-mute">Collection 01 · Equator</p>
      <h1 className="mt-3 font-serif text-6xl">Shop</h1>
      <p className="mt-4 max-w-xl text-mute">
        Every piece is tested on Malé&apos;s sea wall at 31°C and 80% humidity before it reaches you.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3">
        {products.map((p) => (
          <Link key={p.slug} href={`/shop/${p.slug}`} className="group">
            <div className="transition-transform duration-500 group-hover:-translate-y-1">
              <ProductArt product={p} />
            </div>
            <div className="mt-3 flex justify-between gap-2">
              <span>{p.name}</span>
              <span className="text-mute">{formatPrice(p.price)}</span>
            </div>
            <p className="text-sm text-mute">{p.colorway}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
