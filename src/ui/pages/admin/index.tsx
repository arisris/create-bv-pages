import { getSession } from "@/lib/auth";
import type { PageMeta } from "@/lib/renderer";
import { useRequestContext } from "hono/jsx-renderer";

export const meta: PageMeta = {
  title: "Admin Page",
};

export default async function Page() {
  const ctx = useRequestContext();
  const session = await getSession(ctx);
  return (
    <div class="flex flex-col">
      <h1>Hello: {session?.user?.name}</h1>
      <p>Admin Page: {ctx.req.path}</p>
    </div>
  );
}
