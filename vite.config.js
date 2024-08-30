import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import devServer from "@hono/vite-dev-server";
import cloudflare from "@hono/vite-dev-server/cloudflare";

const serverEntry = "src/index.tsx";
const clientEntry = ["src/ui/client.ts", "src/ui/tailwind.css"];
export default defineConfig(({ isSsrBuild, command }) => ({
  plugins: [
    command === "serve"
      ? [
          /** apply serve only plugins */
          devServer({
            entry: serverEntry,
            adapter: cloudflare(),
          }),
        ]
      : [
          /** apply build only plugins */
        ],
    /** provides both build | serve plugins */
  ],
  build: {
    manifest: !isSsrBuild,
    copyPublicDir: !isSsrBuild,
    emptyOutDir: !isSsrBuild,
    outDir: isSsrBuild ? "./dist/_worker.js" : "./dist",
    rollupOptions: {
      input: isSsrBuild ? serverEntry : clientEntry,
      treeshake: {
        preset: isSsrBuild ? "smallest" : "recommended",
        moduleSideEffects: !isSsrBuild,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  ...(command === "serve"
    ? {
        server: {
          port: 3000,
        },
        ssr: {
          target: "webworker",
          noExternal: true,
          external: ["cookie"],
        },
      }
    : {
        esbuild: {
          jsxImportSource: isSsrBuild ? "hono/jsx" : "hono/jsx/dom",
        },
        ssr: {
          target: "webworker",
        },
      }),
}));
