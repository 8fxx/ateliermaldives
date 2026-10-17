"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { FULFILMENT, PAYMENT_METHODS } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { shippingFor } from "@/lib/store";

const OrderInput = z
  .object({
    items: z
      .array(z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(10) }))
      .min(1, "Your bag is empty.")
      .max(30),
    contactName: z.string().trim().min(1, "Please enter a contact name.").max(80),
    contactPhone: z.string().trim().min(5, "Please enter a phone number.").max(30),
    fulfilment: z.enum(FULFILMENT),
    island: z.string().trim().max(80).optional(),
    address: z.string().trim().max(300).optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((o) => o.fulfilment === "pickup" || (o.address && o.island), {
    message: "Please enter your delivery address and island.",
  });

export type PlaceOrderResult = { ok: true; orderId: number } | { ok: false; error: string };

class OrderError extends Error {}

export async function placeOrder(input: z.input<typeof OrderInput>): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to place an order." };

  const parsed = OrderInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const order = parsed.data;

  // Merge duplicate lines for the same variant
  const quantities = new Map<number, number>();
  for (const i of order.items) quantities.set(i.variantId, (quantities.get(i.variantId) ?? 0) + i.quantity);

  try {
    const orderId = await db.transaction(async (tx) => {
      const rows = await tx
        .select({
          variantId: schema.variants.id,
          size: schema.variants.size,
          stock: schema.variants.stock,
          name: schema.products.name,
          slug: schema.products.slug,
          price: schema.products.price,
          active: schema.products.active,
        })
        .from(schema.variants)
        .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
        .where(inArray(schema.variants.id, [...quantities.keys()]));

      const lines = [...quantities].map(([variantId, quantity]) => {
        const row = rows.find((r) => r.variantId === variantId);
        if (!row || !row.active) throw new OrderError("An item in your bag is no longer available.");
        if (row.stock < quantity) {
          throw new OrderError(
            row.stock > 0
              ? `Only ${row.stock} left of ${row.name} (${row.size}).`
              : `${row.name} (${row.size}) just sold out.`,
          );
        }
        return { ...row, quantity };
      });

      for (const line of lines) {
        // Conditional decrement guards against two orders racing for the last unit
        const updated = await tx
          .update(schema.variants)
          .set({ stock: sql`${schema.variants.stock} - ${line.quantity}` })
          .where(and(eq(schema.variants.id, line.variantId), gte(schema.variants.stock, line.quantity)))
          .returning({ id: schema.variants.id });
        if (!updated.length) throw new OrderError(`${line.name} (${line.size}) just sold out.`);
      }

      const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
      const shippingFee = shippingFor(order.fulfilment, subtotal);
      const [created] = await tx
        .insert(schema.orders)
        .values({
          userId: user.id,
          paymentMethod: order.paymentMethod,
          fulfilment: order.fulfilment,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          contactName: order.contactName,
          contactPhone: order.contactPhone,
          island: order.fulfilment === "delivery" ? order.island : null,
          address: order.fulfilment === "delivery" ? order.address : null,
          notes: order.notes || null,
        })
        .returning({ id: schema.orders.id });

      await tx.insert(schema.orderItems).values(
        lines.map((l) => ({
          orderId: created.id,
          variantId: l.variantId,
          productName: l.name,
          productSlug: l.slug,
          size: l.size,
          unitPrice: l.price,
          quantity: l.quantity,
        })),
      );
      return created.id;
    });

    // Remember the phone for next time
    if (!user.phone) await db.update(schema.users).set({ phone: order.contactPhone }).where(eq(schema.users.id, user.id));

    return { ok: true, orderId };
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, error: error.message };
    throw error;
  }
}
