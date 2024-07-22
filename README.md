## create-bv-pages

Minimal template for new cloudflare pages project with bun and vite under the hood.

### What is it?

create-bv-pages is a hackable template for cloudflare pages project.
It use bun and vite to build cloudflare pages with advanced _worker.js script.
can use any framework for server-side like hono, itty-router or any fetch based router, any framework of client-side, 

### How to use

```bash
bun create arisris/create-bv-pages
cd create-bv-pages && bun install
bun dev
```

### How to deploy

I recommend you to use git https://developers.cloudflare.com/pages/get-started/git-integration/. but you can use `bun upload` command to deploy.


### Links
- [Vite](https://vitejs.dev/)
- [Bun](https://bun.sh/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)