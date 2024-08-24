import { Hono } from "hono/tiny";
import { createRootRenderer } from "./ui/renderer";
import AppLayout from "./ui/layouts/app";
import { getAsset } from "./lib/util";

const app = new Hono<HEnv>();

app.use("/*", createRootRenderer());
app.all("/admin/*", async (c) => {
  return c.render(
    <AppLayout noParent mainClass="relative">
      <div
        id="admin-app"
        class="group/admin absolute inline-flex inset-0 max-w-screen-lg mx-auto p-2"
      />
    </AppLayout>,
    {
      title: "Admin App (SPA)",
      slotScripts: (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.initialState = ${JSON.stringify({})}`,
            }}
          />
          <script type="module" src={getAsset("src/ui/admin/index.tsx")} />
        </>
      ),
    }
  );
});
app.get("/", async (c) => {
  return c.render(
    <AppLayout>
      <h3>App Brosss!</h3>
    </AppLayout>,
    {
      title: "Hono App",
    }
  );
});

export default app;
