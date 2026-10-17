import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct, formatPrice } from "@/lib/products";
import { ProductArt } from "@/components/product-art";
import { AddToBag } from "./add-to-bag";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? "Not found", description: product?.description };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-2 md:gap-16">
      <ProductArt product={product} large />
      <div className="md:pt-8">
        <Link href="/shop" className="text-sm text-mute hover:text-ink">
          ← Shop
        </Link>
        <h1 className="mt-6 font-serif text-5xl sm:text-6xl">{product.name}</h1>
        <p className="mt-2 text-mute">{product.colorway}</p>
        <p className="mt-6 text-2xl">{formatPrice(product.price)}</p>
        <p className="mt-6 max-w-md leading-relaxed">{product.description}</p>
        <AddToBag slug={product.slug} sizes={product.sizes} />
        <ul className="mt-10 divide-y divide-line border-y border-line text-sm">
          {product.details.map((d) => (
            <li key={d} className="py-3">
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-mute">
          Free shipping across the Maldives. International shipping calculated at checkout.
        </p>
      </div>
    </section>
  );
}
