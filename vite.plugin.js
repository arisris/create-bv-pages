import { getRequestListener } from "@hono/node-server";
import { getPlatformProxy } from "wrangler";
import path from "node:path";

/** @type {string} */
export const DEFAULT_SERVER_ENTRY = "./src/index.tsx";

/**
 * Vite Dev Server For Fetch Based Server
 * @typedef {{ clientEntry?: string[]; injectClientScript?: boolean; exclude?: RegExp[]; ignoreWatching?: RegExp[]}} DevServerPluginOptions
 * @param {DevServerPluginOptions} options
 * @returns {import("vite").Plugin}
 */
const devServerPlugin = (options = {}) => {
  /**
   * inject string into response
   * @param {Response} response
   * @param {string} str
   * @returns {Response}
   */
  const injectStringToResponse = (response, str) => {
    const encoder = new TextEncoder();
    if (!response.body) return response;
    let injectDone = false;
    const transformedStream = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          async transform(chunk, controller) {
            const endHeadTag = "</head>";
            if (!injectDone && chunk.includes(endHeadTag)) {
              chunk = chunk.replace(endHeadTag, `${str}${endHeadTag}`);
              injectDone = true;
            }
            controller.enqueue(encoder.encode(chunk));
          },
          flush(controller) {
            if (!injectDone) {
              controller.enqueue(encoder.encode(str));
            }
            controller.terminate();
          },
        })
      );

    return new Response(transformedStream, response);
  };
  /** @type {import("wrangler").PlatformProxy} */
  let platformProxy;
  return {
    name: "vite:pages-plugin",
    enforce: "pre",
    config(config, e) {
      return {
        build: {
          manifest: !e.isSsrBuild,
          copyPublicDir: !e.isSsrBuild,
          outDir: e.isSsrBuild ? "dist/_worker.js" : "dist",
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            input: e.isSsrBuild
              ? DEFAULT_SERVER_ENTRY
              : ["./src/client.tsx", ...options.clientEntry],
            treeshake: {
              preset: "smallest",
              moduleSideEffects: false,
              ...config?.build?.rollupOptions?.treeshake,
            },
          },
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
          },
        },
        ...(e.command === "serve"
          ? {
              ssr: {
                noExternal: true,
              },
              server: {
                watch: {
                  ignored: options.ignoreWatching,
                },
              },
            }
          : {
              esbuild: {
                jsxImportSource: e.isSsrBuild ? "hono/jsx" : "hono/jsx/dom",
              },
            }),
      };
    },
    async configureServer(server) {
      if (server.config.command === "build") return;
      let logger = server.config.logger;
      platformProxy = await getPlatformProxy();
      server.middlewares.use(async (req, res, next) => {
        if (options.exclude?.some((r) => r.test(req.url))) {
          return next();
        }
        let fetcher;
        try {
          const ssrModule = await server.ssrLoadModule(DEFAULT_SERVER_ENTRY, {
            fixStacktrace: true,
          });
          if (
            typeof ssrModule?.default !== "object" ||
            typeof ssrModule?.default?.fetch !== "function"
          ) {
            throw new Error("SSR Module is not hono app.");
          } else {
            fetcher = ssrModule.default.fetch;
          }
        } catch (e) {
          return next(e);
        }

        return getRequestListener(
          async (request) => {
            Object.defineProperty(request, "cf", {
              get: () => platformProxy.cf,
            });
            let response = await fetcher(
              request,
              platformProxy.env,
              platformProxy.ctx
            );
            if (!(response instanceof Response)) {
              throw response;
            }
            if (
              options.injectClientScript &&
              response.headers.get("content-type")?.includes("text/html")
            ) {
              response = injectStringToResponse(
                response,
                `<script>import("/@vite/client");</script>`
              );
            }
            return response;
          },
          {
            overrideGlobalObjects: false,
            errorHandler: (e) => {
              let err;
              if (e instanceof Error) {
                err = e;
                server.ssrFixStacktrace(err);
              } else if (typeof e === "string") {
                err = new Error(
                  `The response is not an instance of "Response", but: ${e} is passed.`
                );
              } else {
                err = new Error(`Unknown error: ${e}`);
              }
              next(err);
            },
          }
        )(req, res);
      });
      server.httpServer?.on("close", async () => {
        await platformProxy.dispose();
        logger.info("Workerd restarted.", { timestamp: true });
      });
    },
  };
};

/**
 * @param {DevServerPluginOptions} options
 * @returns {import("vite").Plugin[]}
 */
export default (options = {}) => {
  /** @type {Required<DevServerPluginOptions>} */
  return [
    devServerPlugin({
      ...{
        clientEntry: [],
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
        ignoreWatching: [/\.wrangler/, /\.mf/, /dist/],
      },
      ...options,
    }),
  ];
};
