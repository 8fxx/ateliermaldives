// Writes shopify/products.csv from the starter catalog, for Shopify admin → Products → Import.
// Products import as drafts with 20 in stock per size. Run: npm run shopify:csv
import { writeFileSync } from "node:fs";
import { seedProducts } from "../db/seed-data";

const STOCK = 20;
const header = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Variant SKU", "Variant Inventory Tracker", "Variant Inventory Qty",
  "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Requires Shipping",
  "Variant Taxable", "Status",
];
const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
const abbrev = (size: string) => (size === "One size" ? "OS" : size);

const rows = seedProducts.flatMap((p) =>
  p.sizes.map((size, i) => {
    const first = i === 0;
    const body = `<p>${p.description}</p><p>Colourway: ${p.colorway}</p><ul>${p.details.map((d) => `<li>${d}</li>`).join("")}</ul>`;
    return [
      p.slug,
      first ? p.name : "",
      first ? body : "",
      first ? "EQUATRA" : "",
      first ? p.category : "",
      first ? [p.category, "Collection 01", p.badge].filter(Boolean).join(", ") : "",
      first ? "FALSE" : "",
      first ? "Size" : "",
      size,
      `AM-${p.slug.toUpperCase()}-${abbrev(size)}`,
      "shopify",
      STOCK,
      "deny",
      "manual",
      (p.price / 100).toFixed(2),
      "TRUE",
      "TRUE",
      first ? "draft" : "",
    ];
  }),
);

writeFileSync("shopify/products.csv", [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n");
console.log(`Wrote shopify/products.csv (${seedProducts.length} products, ${rows.length} variants)`);
