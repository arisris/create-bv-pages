import AdminLayout from "@/ui/layouts/admin";
import AppLayout from "@/ui/layouts/app";
import { jsxRenderer, useRequestContext } from "hono/jsx-renderer";

export default function adminRenderer() {
  return jsxRenderer(
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
  );
}
