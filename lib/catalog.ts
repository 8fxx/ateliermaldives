import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export type CatalogProduct = Awaited<ReturnType<typeof getActiveProducts>>[number];

export function getActiveProducts() {
  return db.query.products.findMany({
    where: eq(schema.products.active, true),
    orderBy: [asc(schema.products.sortOrder), asc(schema.products.id)],
    with: { variants: { orderBy: asc(schema.variants.position) } },
  });
}

export function getActiveProduct(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(schema.products.slug, slug), eq(schema.products.active, true)),
    with: { variants: { orderBy: asc(schema.variants.position) } },
  });
}
