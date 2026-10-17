import { defineConfig } from "drizzle-kit";

// Load .env.local when present (Next.js does this for the app, but not for scripts)
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
