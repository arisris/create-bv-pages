import type { JSX, PropsWithChildren } from "hono/jsx";
import { $adminRouter } from "../store/router";
import { useAdminRouter } from "../hooks/admin";

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
