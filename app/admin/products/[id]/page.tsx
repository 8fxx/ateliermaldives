import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditProductPage({ params, searchParams }: Props) {
  const id = Number((await params).id) || 0;
  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, id),
    with: { variants: { orderBy: asc(schema.variants.position) } },
  });
  if (!product) notFound();
  const created = (await searchParams).created === "1";

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-mute hover:text-ink">
        ← Products
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl">{product.name}</h1>
        {product.active && (
          <Link href={`/shop/${product.slug}`} className="text-sm underline underline-offset-4" target="_blank">
            View in shop ↗
          </Link>
        )}
      </div>
      {created && <p className="mt-4 rounded-2xl bg-lagoon px-5 py-3 text-sm text-salt">Product created.</p>}
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: (product.price / 100).toFixed(2),
          colorway: product.colorway,
          description: product.description,
          details: product.details.join("\n"),
          paletteBg: product.paletteBg,
          paletteFg: product.paletteFg,
          badge: product.badge ?? "",
          active: product.active,
          variants: product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
        }}
      />
    </div>
  );
}
