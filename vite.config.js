import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import plugin from "./vite.plugin";

export default defineConfig({
  plugins: [
    plugin({
      clientEntry: ["./src/ui/tailwind.css"],
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  ssr: {
    external: ["cookie"],
  },
  server: {
    port: 3000,
  },
});
