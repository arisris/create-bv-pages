import { render } from "hono/jsx/dom";
import { useAdminRouter } from "../hooks/admin";
import AdminLayout from "../layouts/admin";
import AdminDashboardPage from "./dashboard";
import AdminPostsPage from "./posts";
import AdminSettingsPage from "./settings";
import AdminChatPage from "./chat";
import AdminNotFoundPage from "./not-found";
import AdminCategoriesPage from "./categories";

function Routes() {
  const { router } = useAdminRouter();
  switch (router?.route) {
    case "dashboard":
      return <AdminDashboardPage />;
    case "posts":
      return <AdminPostsPage />;
    case "categories":
      return <AdminCategoriesPage />;
    case "chat":
      return <AdminChatPage />;
    case "settings":
      return <AdminSettingsPage />;
    default:
      return <AdminNotFoundPage />;
  }
}

const App = () => {
  return (
    <AdminLayout>
      <Routes />
    </AdminLayout>
  );
};

render(<App />, document.getElementById("admin-app")!);

document.dispatchEvent(
  new CustomEvent("admin:load", {
    detail: {
      hello: "admin",
    },
  })
);
