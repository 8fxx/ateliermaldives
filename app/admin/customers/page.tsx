import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { ROLES } from "@/db/schema";
import { isAdmin, requireRole } from "@/lib/auth";
import { formatPrice } from "@/lib/store";
import { formatDate } from "@/components/order-bits";
import { setUserRole } from "../actions";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const me = await requireRole("staff");
  const admin = isAdmin(me);
  const { users, orders } = schema;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(${orders.id})`,
      spent: sql<number>`coalesce(sum(case when ${orders.status} != 'cancelled' then ${orders.total} end), 0)`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(500);

  return (
    <div>
      <h1 className="font-serif text-5xl">{admin ? "Customers & staff" : "Customers"}</h1>
      {admin && (
        <p className="mt-3 max-w-2xl text-sm text-mute">
          <strong className="text-ink">Staff</strong> can manage orders and products. <strong className="text-ink">Admins</strong> can
          also change who has back-office access.
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-3xl bg-salt">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-xs text-mute">
            <tr className="border-b border-line">
              <th className="p-4 font-normal">Name</th>
              <th className="p-4 font-normal">Joined</th>
              <th className="p-4 text-right font-normal">Orders</th>
              <th className="p-4 text-right font-normal">Spent</th>
              <th className="p-4 font-normal">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="p-4">
                  {u.name}
                  <span className="block text-xs text-mute">
                    {u.email}
                    {u.phone && ` · ${u.phone}`}
                  </span>
                </td>
                <td className="p-4 text-mute">{formatDate(u.createdAt)}</td>
                <td className="p-4 text-right tabular-nums">{u.orderCount}</td>
                <td className="p-4 text-right tabular-nums">{formatPrice(u.spent)}</td>
                <td className="p-4">
                  {admin && u.id !== me.id ? (
                    <form action={setUserRole} className="flex gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select name="role" defaultValue={u.role} className="rounded-lg border border-line bg-salt px-2 py-1 text-xs">
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button className="text-xs underline underline-offset-4">Update</button>
                    </form>
                  ) : (
                    <span className="capitalize">{u.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
