// This file is entrypoint for cloudflare pages _worker.js

import { getScript } from "./lib/manifest"

export default {
  async fetch(req, env, _ctx) {
    const url = new URL(req.url)
    if (url.pathname !== "/") {
      return new Response("Not found", {
        headers: { "content-type": "text/plain" },
        status: 404
      })
    }
    return new Response(`<!DOCTYPE html>
<html>
  <head>
    <title>${env.STR_MESSAGE}</title>
  </head>
  <body>
    <h1>${env.STR_MESSAGE}</h1>
    <counter-app initial="10"></counter-app>
    <script type="module" src="${getScript("client/index.ts")}"></script>
  </body>
</html>`, {
      headers: {
        "Content-Type": "text/html"
      }
    })
  }
} satisfies ExportedHandler<Env>