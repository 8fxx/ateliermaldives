/**
 * Seeds the catalog and an admin account.
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run db:seed
 * Safe to re-run: existing products and users are left alone.
 */
import "./load-env";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { seedProducts } from "../db/seed-data";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

async function main() {
  for (const [i, p] of seedProducts.entries()) {
    const existing = await db.query.products.findFirst({ where: eq(schema.products.slug, p.slug) });
    if (existing) continue;
    const [row] = await db
      .insert(schema.products)
      .values({
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: p.price,
        colorway: p.colorway,
        description: p.description,
        details: p.details,
        paletteBg: p.palette[0],
        paletteFg: p.palette[1],
        badge: p.badge ?? null,
        sortOrder: i,
      })
      .returning({ id: schema.products.id });
    await db.insert(schema.variants).values(p.sizes.map((size, position) => ({ productId: row.id, size, stock: 20, position })));
    console.log(`+ product ${p.name}`);
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existing) {
      await db.update(schema.users).set({ role: "admin" }).where(eq(schema.users.id, existing.id));
      console.log(`✓ ${email} is now an admin`);
    } else {
      const salt = randomBytes(16);
      const key = await scrypt(password, salt, 64);
      await db.insert(schema.users).values({
        email,
        name: "Equatra Admin",
        role: "admin",
        passwordHash: `scrypt$${salt.toString("hex")}$${key.toString("hex")}`,
      });
      console.log(`+ admin ${email}`);
    }
  } else {
    console.log("(set ADMIN_EMAIL and ADMIN_PASSWORD to create an admin account)");
  }
}

main().then(() => process.exit(0));
