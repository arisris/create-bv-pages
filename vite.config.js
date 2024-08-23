import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import plugin from "./vite.plugin";

export default defineConfig({
  plugins: [
    plugin({
      clientEntry: ["./src/ui/tailwind.css", "./src/ui/admin/client.tsx"],
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});
