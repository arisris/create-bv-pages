import { type Connect, type Plugin } from "vite"
import { getRequestListener } from "@hono/node-server"
import { getPlatformProxy, type PlatformProxy } from "wrangler"

type HonoDevServerPlugin = {
  entry?: string
  export?: string
  injectClientScript?: boolean
  exclude?: RegExp[]
  ignoreWatching?: RegExp[]
}

const injectStringToResponse = (response: Response, str: string): Response => {
  const encoder = new TextEncoder();
  if (!response.body) return response;
  let injectDone = false
  const transformedStream = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TransformStream({
      async transform(chunk, controller) {
        const endHeadTag = "</head>"
        if (!injectDone && chunk.includes(endHeadTag)) {
          chunk = chunk.replace(endHeadTag, `${str}${endHeadTag}`)
          injectDone = true
        }
        controller.enqueue(encoder.encode(chunk))
      },
      flush(controller) {
        if (!injectDone) {
          controller.enqueue(encoder.encode(str))
        }
        controller.terminate()
      },
    }))

  return new Response(transformedStream, response)
}

const defaultOptions: Required<HonoDevServerPlugin> = {
  entry: './src/index.ts',
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
  ignoreWatching: [/\.wrangler/, /\.mf/]
}

export default function honoDevServer(options: HonoDevServerPlugin = {}): Plugin {
  options = { ...defaultOptions, ...options }
  let platformProxy: PlatformProxy
  return {
    name: "hono:dev-server",
    apply(_, env) {
      return env.command === "serve"
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
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (options.exclude?.some((r) => r.test(req.url!))) {
          return next()
        }
        let fetcher: any;
        try {
          const ssrModule = await server.ssrLoadModule(options.entry!, { fixStacktrace: true })
          if (typeof ssrModule?.default !== "object" || typeof ssrModule?.default?.fetch !== "function") {
            throw new Error("SSR Module is not hono app.")
          } else {
            fetcher = ssrModule.default.fetch
          }
        } catch (e) {
          return next(e)
        }

        return getRequestListener(async (request) => {
          Object.defineProperty(request, "cf", {
            get: () => platformProxy.cf
          })
          let response = await fetcher(request, platformProxy.env, platformProxy.ctx)
          if (!(response instanceof Response)) {
            throw response
          }
          if (options.injectClientScript && response.headers.get("content-type")?.includes("text/html")) {
            response = injectStringToResponse(response, `<script>import("/@vite/client");</script>`)
          }
          return response
        }, {
          overrideGlobalObjects: false,
          errorHandler: (e) => {
            let err: Error
            if (e instanceof Error) {
              err = e
              server.ssrFixStacktrace(err)
            } else if (typeof e === 'string') {
              err = new Error(`The response is not an instance of "Response", but: ${e} is passed.`)
            } else {
              err = new Error(`Unknown error: ${e}`)
            }
            next(err)
          }
        })(req, res)
      }
      server.middlewares.use(handler)
      server.httpServer?.on("close", async () => {
        await platformProxy.dispose()
        logger.info("Workerd proxy restarted.", { timestamp: true })
      })
    }
  }
}