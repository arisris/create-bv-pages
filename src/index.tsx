import { Hono } from "hono/tiny";
import { setupAuthPage, onlySignedUser } from "./lib/auth";
import { createRootRenderer, renderPage } from "./lib/renderer";
import adminRenderer from "./ui/pages/admin/renderer";
import pageRenderer from "./ui/pages/renderer";
import { showRoutes } from "hono/dev";

declare module "hono" {
  interface Env extends HEnv {}
}

const app = new Hono();

app.use(createRootRenderer()).use(pageRenderer());

const api = app
  .basePath("/api")
  .use("/auth/*", setupAuthPage())
  .get("/hello", (c) => c.json({ msg: "Hello World" }));

showRoutes(api);

export type ApiType = typeof api;

app
  .basePath("/admin")
  .use(onlySignedUser())
  .use(adminRenderer())
  .all(
    "/*",
    renderPage(() => import("@/ui/pages/admin"))
  );

app.get(
  "/",
  renderPage(() => import("@/ui/pages/home"))
);

export default app;
