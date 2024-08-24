import { createRouter } from "@nanostores/router";

export const $adminRouter = createRouter(
  {
    dashboard: "/admin",
    posts: "/admin/posts",
    categories: "/admin/categories",
    chat: "/admin/chat",
    settings: "/admin/settings",
  },
  { links: false }
);