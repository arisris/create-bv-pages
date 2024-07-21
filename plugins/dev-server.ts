import { Connect, type Plugin } from "vite"
import { getPlatformProxy, type PlatformProxy } from "wrangler"

export const getHeaders = (req: Connect.IncomingMessage) => {
  const h = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) {
        h.append(key, v)
      }
    } else {
      h.append(key, value)
    }
  }
  return h
}

export const getBody = async (req: Connect.IncomingMessage) => {
  let body: BodyInit | undefined
  if (req.method !== "GET") {
    body = await new Promise((resolve) => {
      let b = ""
      req.on("data", (chunk) => {
        b += chunk
      })
      req.on("end", () => {
        resolve(b)
      })
    })
  }
  return body
}

type DevServerOptions = {
  entry?: string
  export?: string
  injectClientScript?: boolean
  exclude?: RegExp[]
  ignoreWatching?: RegExp[]
}

export const defaultOptions: Required<DevServerOptions> = {
  entry: './src/worker.ts',
  export: 'default',
  injectClientScript: true,
  exclude: [
    /.*\.css$/,
    /.*\.ts$/,
    /.*\.tsx$/,
    /^\/@.+$/,
    /\?t\=\d+$/,
    /^\/favicon\.ico$/,
    /^\/assets\/.+/,
    /^\/node_modules\/.*/,
  ],
  ignoreWatching: [/\.wrangler/, /\.mf/],
}

export function devServer(options: DevServerOptions = {}): Plugin {
  // if (!("Bun" in globalThis)) {
  //   throw new Error(`This Plugin Only Works in Bun`);
  // }
  let platformProxy: PlatformProxy
  options = { ...defaultOptions, ...options }
  return {
    name: "bun-vite:dev-server",
    apply(_, { command }) {
      return command === "serve"
    },
    config(config) {
      return {
        ssr: {
          noExternal: true,
          ...config.ssr
        }
      }
    },
    async configureServer(server) {
      let logger = server.config.logger
      platformProxy = await getPlatformProxy()
      server.middlewares.use(async (req, res, next) => {
        if (options.exclude?.some((r) => r.test(req.url!))) {
          return next()
        }
        let appModule: any;
        try {
          const ssrModule = await server.ssrLoadModule(options.entry!, { fixStacktrace: true })
          if (typeof ssrModule?.default === "object" && typeof ssrModule?.default?.fetch === "function") {
            appModule = ssrModule.default
          } else {
            throw new Error("Entry must export a default object with a fetch function property");
          }
        } catch (error) {
          return next(error)
        }
        try {
          const headers = getHeaders(req)
          const request = new Request(new URL(req.url!, `http://${req.headers.host}`), {
            method: req.method,
            headers,
            body: await getBody(req)
          })
          Object.defineProperty(request, "cf", {
            get: () => platformProxy.cf
          })
          let response: Response | undefined = await appModule.fetch(request, platformProxy.env, platformProxy.ctx)
          if (!response || !(response instanceof Response)) {
            return next(new Error("Invalid response from worker"))
          }
          
          if (options.injectClientScript && response.headers.get("Content-Type")?.match(/^text\/html/)) {
            // console.log("Injecting client script")
            const rewriter = new HTMLRewriter()
            rewriter.on("head", {
              element(element) {
                if (options.injectClientScript) {
                  element.append(
                    `<script>import("/@vite/client")</script>`,
                    { html: true }
                  )
                }
              },
            })
            response = await Promise.resolve(rewriter.transform(response))
          }
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          res.statusCode = response.status
          res.statusMessage = response.statusText
          const reader = response.body?.getReader()
          if (!reader) {
            res.end()
            return
          }
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(value)
          }
          res.end()
          return
        } catch (error) {
          return next(error)
        }
      })
      server.httpServer?.on("close", async () => {
        await platformProxy.dispose()
        logger.info("Workerd proxy restarted.", { timestamp: true })
      })
    }
  }
}

export default devServer