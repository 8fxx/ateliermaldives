"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { CATEGORIES, ORDER_STATUSES, PAYMENT_STATUSES, ROLES } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export type ActionState = { error?: string; ok?: string } | undefined;

// ---------- Orders (staff) ----------

const OrderUpdate = z.object({
  orderId: z.coerce.number().int().positive(),
  status: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  adminNotes: z.string().trim().max(1000).optional(),
});

export async function updateOrder(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("staff");
  const parsed = OrderUpdate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid update." };
  const { orderId, status, paymentStatus, adminNotes } = parsed.data;

  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId), with: { items: true } });
  if (!order) return { error: "Order not found." };
  if (order.status === "cancelled" && status !== "cancelled") {
    return { error: "Cancelled orders can't be reopened. Ask the customer to order again." };
  }

  await db.transaction(async (tx) => {
    // Put cancelled stock back on the shelf
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx
          .update(schema.variants)
          .set({ stock: sql`${schema.variants.stock} + ${item.quantity}` })
          .where(eq(schema.variants.id, item.variantId));
      }
    }
    await tx
      .update(schema.orders)
      .set({ status, paymentStatus, adminNotes: adminNotes || null, updatedAt: new Date() })
      .where(eq(schema.orders.id, orderId));
  });

  revalidatePath("/admin", "layout");
  return { ok: "Order updated." };
}

// ---------- Products (staff) ----------

const ProductInput = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and dashes."),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().positive("Price must be more than 0.").max(100000),
  colorway: z.string().trim().max(80).default(""),
  description: z.string().trim().max(2000).default(""),
  details: z.string().max(2000).default(""),
  paletteBg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  paletteFg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  badge: z.string().trim().max(20).default(""),
  active: z.literal("on").optional(),
  variants: z
    .array(z.object({ id: z.number().int().positive().optional(), size: z.string().trim().min(1).max(20), stock: z.number().int().min(0).max(100000) }))
    .min(1, "Add at least one size."),
});

export async function saveProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("staff");

  let variants: unknown;
  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    return { error: "Invalid sizes." };
  }
  const parsed = ProductInput.safeParse({ ...Object.fromEntries(formData), id: formData.get("id") || undefined, variants });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;

  const sizes = p.variants.map((v) => v.size.toLowerCase());
  if (new Set(sizes).size !== sizes.length) return { error: "Each size can only appear once." };

  const clash = await db.query.products.findFirst({ where: eq(schema.products.slug, p.slug) });
  if (clash && clash.id !== p.id) return { error: "Another product already uses that slug." };

  const values = {
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: Math.round(p.price * 100),
    colorway: p.colorway,
    description: p.description,
    details: p.details
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean),
    paletteBg: p.paletteBg,
    paletteFg: p.paletteFg,
    badge: p.badge || null,
    active: p.active === "on",
  };

  const productId = await db.transaction(async (tx) => {
    let id = p.id;
    if (id) {
      await tx.update(schema.products).set(values).where(eq(schema.products.id, id));
    } else {
      [{ id }] = await tx.insert(schema.products).values(values).returning({ id: schema.products.id });
    }

    const keepIds = p.variants.flatMap((v) => (v.id ? [v.id] : []));
    // Removed sizes are deleted; past orders keep their own snapshot of name/size/price
    await tx
      .delete(schema.variants)
      .where(
        keepIds.length
          ? and(eq(schema.variants.productId, id!), notInArray(schema.variants.id, keepIds))
          : eq(schema.variants.productId, id!),
      );
    for (const [position, v] of p.variants.entries()) {
      if (v.id) {
        await tx
          .update(schema.variants)
          .set({ size: v.size, stock: v.stock, position })
          .where(and(eq(schema.variants.id, v.id), eq(schema.variants.productId, id!)));
      } else {
        await tx.insert(schema.variants).values({ productId: id!, size: v.size, stock: v.stock, position });
      }
    }
    return id!;
  });

  revalidatePath("/", "layout");
  if (!p.id) redirect(`/admin/products/${productId}?created=1`);
  return { ok: "Saved." };
}

// ---------- Customers (admin only) ----------

export async function setUserRole(formData: FormData) {
  const me = await requireRole("admin");
  const userId = Number(formData.get("userId"));
  const role = z.enum(ROLES).safeParse(formData.get("role"));
  // Admins can't demote themselves, so the store is never left without an admin
  if (!role.success || !userId || userId === me.id) return;
  await db.update(schema.users).set({ role: role.data }).where(eq(schema.users.id, userId));
  if (role.data === "customer") {
    // Drop existing sessions so back-office access ends immediately
    await db.delete(schema.sessions).where(inArray(schema.sessions.userId, [userId]));
  }
  revalidatePath("/admin/customers");
}
