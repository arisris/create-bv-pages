import { defineConfig } from "vite"
import { dependencies } from "./package.json"
import devServer from "./plugins/dev-server"

export default defineConfig(({ command, isSsrBuild }) => {
  const isServe = command === "serve",
    clientEntries = [
      "./client/index.ts"
    ],
    serverEntry = "./worker/index.ts",
    external = [...Object.keys(dependencies), ...[
      // externalize modules
    ]]
  return {
    plugins: [devServer({ entry: serverEntry })],
    build: {
      manifest: !isSsrBuild,
      copyPublicDir: !isSsrBuild,
      outDir: isSsrBuild ? "dist/_worker.js" : "dist",
      rollupOptions: {
        input: isSsrBuild ? [serverEntry] : clientEntries
      }
    },
    ssr: {
      external: isServe ? external : undefined,
    },
    ...(isServe ? {} : {
      esbuild: {
        // jsxImportSource: isSsrBuild ? "hono/jsx" : "hono/jsx/dom",
      }
    }),
    server: {
      port: 3000 // listen to port
    }
  }
})