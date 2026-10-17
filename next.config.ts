import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The libSQL driver ships native bindings and non-JS files; load it from node_modules instead of bundling
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
