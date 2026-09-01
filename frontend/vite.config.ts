import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

const root = import.meta.dirname;

// Mirrors reference/frontend/vite.config.ts: dedicated outDir matching the
// backend's dedicated static mount (/app/, see src/plugins/appStatic.js),
// base set to the same prefix so emitted asset URLs resolve correctly, dev
// proxy to the local Fastify API so `npm run dev` works standalone.
//
// Multi-page build: one HTML entry per migrated page, each with its own
// small main-*.tsx bootstrap. Backend routes serve the matching HTML file
// directly (reply.sendFile("admin-login.html", ...)); all pages share this
// one build/output so assets never need per-section base configs.
export default defineConfig(({ command }) => {
  process.env.NODE_ENV ||= command === "build" ? "production" : "development";

  return {
    base: "/app/",
    plugins: [react()],
    resolve: { alias: { "@": path.resolve(root, "./src") } },
    build: {
      outDir: path.resolve(root, "../public/app"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          "admin-login": path.resolve(root, "admin-login.html"),
          "admin-totp": path.resolve(root, "admin-totp.html"),
          "portal-login": path.resolve(root, "portal-login.html"),
          "portal-change-password": path.resolve(root, "portal-change-password.html"),
          "portal-dashboard": path.resolve(root, "portal-dashboard.html"),
          "portal-home": path.resolve(root, "portal-home.html"),
          "root-login": path.resolve(root, "root-login.html"),
        },
      },
    },
    server: {
      port: 5174,
      proxy: {
        "/api": "http://localhost:4000",
      },
    },
  };
});
