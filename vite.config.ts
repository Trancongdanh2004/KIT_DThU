import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The showcase in demo/ renders the kit straight from src/. `vite build` writes it next to the registry in public/,
// so one static host serves both the site and /r/*.json.
export default defineConfig({
  root: at("./demo"),
  base: "./",
  publicDir: at("./public"),
  plugins: [
    react(),
    tailwindcss(),
    // outDir is shared with the registry, so only the showcase's own output is cleared before a build.
    { name: "clean-showcase", apply: "build", buildStart: () => rmSync(at("./public/assets"), { recursive: true, force: true }) },
  ],
  // src/ is a verbatim copy of RIS, which imports through both `@/` and `~/`.
  resolve: { alias: { "@": at("./src"), "~": at("./src") } },
  define: { __KIT_BASE_URL__: JSON.stringify((process.env.KIT_BASE_URL ?? "http://localhost:4300").replace(/\/+$/, "")) },
  build: { outDir: at("./public"), emptyOutDir: false, copyPublicDir: false, chunkSizeWarningLimit: 2000 },
  server: { port: 5180 },
});
