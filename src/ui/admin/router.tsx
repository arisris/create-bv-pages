import { useStore } from "@/lib/store";
import { createRouter } from "@nanostores/router";
import type { JSX, PropsWithChildren } from "hono/jsx";

const $adminRouter = createRouter(
  {
    dashboard: "/admin",
    posts: "/admin/posts",
    categories: "/admin/categories",
    chat: "/admin/chat",
    settings: "/admin/settings",
  },
  { links: false }
);

export const useAdminRouter = () => {
  const router = useStore($adminRouter);
  return {
    router: router,
    open: (href: string) => {
      $adminRouter.open(href);
    },
  };
};

export const A = ({
  children,
  href,
  onClick,
  ...props
}: PropsWithChildren<JSX.IntrinsicElements["a"]>) => {
  const { router } = useAdminRouter();
  return (
    <a
      {...props}
      data-active={href ? router?.path === href : undefined}
      href={href}
      onClick={(e) => {
        if (href) {
          e.preventDefault();
          $adminRouter.open(href);
        }
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
};

export default function AdminRouter() {
  const { router } = useAdminRouter();
  if (router?.route === "dashboard") {
    return <div>Dashboard</div>;
  }
  if (router?.route === "posts") {
    return <div>Posts</div>;
  }
  if (router?.route === "categories") {
    return <div>Categories</div>;
  }
  if (router?.route === "chat") {
    return <div>Chat</div>;
  }

  return <div>404</div>;
}
