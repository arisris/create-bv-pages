import { Hono } from "hono/tiny";
import { createRootRenderer } from "./ui/renderer";
import { getAsset } from "./lib/util";
import {
  AUTH_ROUTE_PATH,
  setupAuthPage,
  onlySignedUser,
  getSession,
} from "./lib/auth";
import AppLayout from "./ui/layouts/app";
import AdminLayout from "./ui/layouts/admin";
import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";

declare module "hono" {
  interface Env extends HEnv {}
}

const app = new Hono();

app.use(AUTH_ROUTE_PATH, setupAuthPage());
app.use("/*", createRootRenderer());
app.all(
  "/admin/*",
  onlySignedUser(),
  jsxRenderer(
    ({ children, Layout, ...props }) => (
      <Layout {...props}>
        <AppLayout noParent mainClass="relative">
          <AdminLayout currentPath={useRequestContext().req.path}>
            {children}
          </AdminLayout>
        </AppLayout>
      </Layout>
    ),
    { stream: false }
  ),
  async (c) => {
    const session = await getSession(c);
    return c.render(
      <div class="flex flex-col">
        <h1>Hello: {session?.user?.name}</h1>
        <p>Admin Page: {c.req.path}</p>
      </div>,
      {
        title: "Example Admin",
        slotScripts: (
          <>
            {/* Your scripts */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.initialState = ${JSON.stringify({})}`,
              }}
            />
          </>
        ),
      }
    );
  }
);
app.get("/", async (c) => {
  return c.render(
    <AppLayout>
      {/* Create HomePage */}
      <h1>This is HomePage</h1>
      <a href="/admin" class="text-blue-500">Go To Admin Page (auth)</a>
    </AppLayout>,
    {
      title: "Hono App",
    }
  );
});

export default app;
