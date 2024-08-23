import { render } from "hono/jsx/dom";
import AdminLayout from "./layout";
import AdminRouter from "./router";

const App = () => {
  return (
    <AdminLayout>
      <AdminRouter />
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
