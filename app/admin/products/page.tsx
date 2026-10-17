import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatPrice } from "@/lib/store";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await db.query.products.findMany({
    orderBy: [asc(schema.products.sortOrder), asc(schema.products.id)],
    with: { variants: { orderBy: asc(schema.variants.position) } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl">Products</h1>
        <Link href="/admin/products/new" className="btn-dark">
          + New product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl bg-salt">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-xs text-mute">
            <tr className="border-b border-line">
              <th className="p-4 font-normal">Product</th>
              <th className="p-4 font-normal">Price</th>
              <th className="p-4 font-normal">Stock by size</th>
              <th className="p-4 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const total = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-sand/60">
                  <td className="p-4">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span
                        className="h-10 w-8 shrink-0 rounded-md"
                        style={{ background: `linear-gradient(135deg, ${p.paletteBg}, ${p.paletteFg})` }}
                      />
                      <span>
                        <span className="font-medium hover:underline">{p.name}</span>
                        <span className="block text-xs text-mute">
                          {p.category} · {p.colorway}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="p-4 tabular-nums">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.variants.map((v) => (
                        <span
                          key={v.id}
                          className={`rounded-md px-2 py-0.5 text-xs ${
                            v.stock === 0 ? "bg-coral/15 text-coral" : v.stock <= 3 ? "bg-coral/5 text-ink" : "bg-sand"
                          }`}
                        >
                          {v.size}: {v.stock}
                        </span>
                      ))}
                    </div>
                    <span className="mt-1 block text-xs text-mute">{total} total</span>
                  </td>
                  <td className="p-4">
                    {p.active ? (
                      <span className="text-lagoon">● Live</span>
                    ) : (
                      <span className="text-mute">○ Hidden</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
