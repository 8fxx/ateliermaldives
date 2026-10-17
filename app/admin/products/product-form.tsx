"use client";

import { useActionState, useState } from "react";
import { CATEGORIES } from "@/db/enums";
import { ProductArt } from "@/components/product-art";
import { saveProduct, type ActionState } from "../actions";

type VariantRow = { id?: number; size: string; stock: number };
type FormProduct = {
  id: number;
  name: string;
  slug: string;
  category: (typeof CATEGORIES)[number];
  price: string;
  colorway: string;
  description: string;
  details: string;
  paletteBg: string;
  paletteFg: string;
  badge: string;
  active: boolean;
  variants: VariantRow[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function ProductForm({ product }: { product?: FormProduct }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProduct, undefined);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [category, setCategory] = useState(product?.category ?? "Tops");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [bg, setBg] = useState(product?.paletteBg ?? "#0f6e78");
  const [fg, setFg] = useState(product?.paletteFg ?? "#f2efe8");
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants ?? ["XS", "S", "M", "L", "XL"].map((size) => ({ size, stock: 0 })),
  );

  const updateVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form action={action} className="mt-8 grid gap-8 lg:grid-cols-3">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      <div className="space-y-6 rounded-3xl bg-salt p-6 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow text-mute">Name</span>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="field mt-2"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-mute">URL slug</span>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="field mt-2 font-mono"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-mute">Category</span>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as FormProduct["category"])}
              className="field mt-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow text-mute">Price (USD)</span>
            <input name="price" required type="number" min="0.01" step="0.01" defaultValue={product?.price} className="field mt-2" />
          </label>
          <label className="block">
            <span className="eyebrow text-mute">Colourway</span>
            <input name="colorway" defaultValue={product?.colorway} placeholder="Lagoon / Salt" className="field mt-2" />
          </label>
          <label className="block">
            <span className="eyebrow text-mute">Badge (optional)</span>
            <input name="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="New, Limited…" className="field mt-2" />
          </label>
        </div>

        <label className="block">
          <span className="eyebrow text-mute">Description</span>
          <textarea name="description" rows={3} defaultValue={product?.description} className="field mt-2" />
        </label>
        <label className="block">
          <span className="eyebrow text-mute">Details (one per line)</span>
          <textarea name="details" rows={4} defaultValue={product?.details} className="field mt-2" />
        </label>

        <div>
          <span className="eyebrow text-mute">Sizes & stock</span>
          <div className="mt-2 space-y-2">
            {variants.map((v, i) => (
              <div key={v.id ?? `new-${i}`} className="flex items-center gap-2">
                <input
                  value={v.size}
                  onChange={(e) => updateVariant(i, { size: e.target.value })}
                  placeholder="Size"
                  className="field w-32 py-2"
                  aria-label="Size"
                />
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(i, { stock: Math.max(0, Number(e.target.value) || 0) })}
                  className="field w-28 py-2"
                  aria-label={`Stock for ${v.size}`}
                />
                <span className="text-xs text-mute">in stock</span>
                <button
                  type="button"
                  onClick={() => setVariants((rows) => rows.filter((_, j) => j !== i))}
                  className="ml-auto text-xs text-mute hover:text-coral"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVariants((rows) => [...rows, { size: "", stock: 0 }])}
            className="mt-3 text-sm underline underline-offset-4"
          >
            + Add size
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-salt p-6">
          <span className="eyebrow text-mute">Card colours</span>
          <div className="mt-3 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="color" name="paletteBg" value={bg} onChange={(e) => setBg(e.target.value)} /> Background
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="color" name="paletteFg" value={fg} onChange={(e) => setFg(e.target.value)} /> Text
            </label>
          </div>
          <div className="mt-4">
            <ProductArt product={{ name: name || "Product name", category, badge: badge || null, paletteBg: bg, paletteFg: fg }} />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl bg-salt p-6">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-4 w-4 accent-lagoon" />
            Visible in the shop
          </label>
          {state?.error && <p className="text-sm text-coral">{state.error}</p>}
          {state?.ok && <p className="text-sm text-lagoon">{state.ok}</p>}
          <button className="btn-dark w-full" disabled={pending}>
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}
