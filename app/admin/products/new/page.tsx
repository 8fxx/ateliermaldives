import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-mute hover:text-ink">
        ← Products
      </Link>
      <h1 className="mt-4 font-serif text-5xl">New product</h1>
      <ProductForm />
    </div>
  );
}
