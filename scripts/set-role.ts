/**
 * Change a user's role from the command line:
 *   npm run user:role -- someone@example.com admin   (customer | staff | admin)
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { ROLES } from "../db/enums";

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !ROLES.includes(role as (typeof ROLES)[number])) {
    console.error(`Usage: npm run user:role -- <email> <${ROLES.join(" | ")}>`);
    process.exit(1);
  }
  const updated = await db
    .update(schema.users)
    .set({ role: role as (typeof ROLES)[number] })
    .where(eq(schema.users.email, email.trim().toLowerCase()))
    .returning({ id: schema.users.id });
  console.log(updated.length ? `✓ ${email} is now ${role}` : `No user with email ${email}`);
}

main().then(() => process.exit(0));
