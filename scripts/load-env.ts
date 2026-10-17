// Load .env.local when present (Next.js does this for the app, but not for scripts).
// Imported first so it runs before modules that read process.env.
try {
  process.loadEnvFile(".env.local");
} catch {}
