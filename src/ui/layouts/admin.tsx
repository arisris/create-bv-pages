import type { FC, PropsWithChildren } from "hono/jsx";
import clsx from "clsx";
import { useAdminRouter } from "../hooks/admin";
import { A } from "../components/link";

type MenuItem = {
  href: string;
  title: string;
  icon?: string;
  isActive?: boolean;
  submenu?: [string, string][];
}[];

const defaultMenus: MenuItem = [
  {
    href: "/admin",
    title: "Dashboard",
    icon: "ri--dashboard-3-line",
  },
  {
    href: "/admin/posts",
    title: "Posts",
    icon: "ri--sticky-note-add-line",
  },
  {
    href: "/admin/categories",
    title: "Categories",
    icon: "ri--folder-line",
    submenu: [
      ["#", "Category 1"],
      ["#", "Category 2"],
      ["#", "Category 3"],
    ],
  },
  {
    href: "/admin/chat",
    title: "Chat",
    icon: "ri--chat-3-line",
  },
];

const AdminLayout: FC<
  PropsWithChildren<{
    menuItems?: MenuItem;
  }>
> = ({ children, menuItems }) => {
  const menus = [...defaultMenus, ...(menuItems ?? [])];
  const { router } = useAdminRouter();
  return (
    <>
      <input type="checkbox" id="admin-aside" class="hidden peer" />
      <aside class="flex flex-col justify-between whitespace-nowrap overflow-hidden transition-[width] duration-300 ease-in-out w-0 peer-checked:w-56 peer-checked:border-r md:w-56 md:border-r md:peer-checked:w-0 md:peer-checked:border-none">
        <div class="flex items-center gap-2 border-b p-2">
          <h3 class="text-xl font-bold">Admin Panel</h3>
        </div>
        <menu class="flex flex-col gap-y-1 mb-auto p-2">
          {menus.map((item) => (
            <li>
              {item.submenu ? (
                <details
                  class="group"
                  open={router?.path.startsWith(item.href) || item.isActive}
                >
                  <summary class="flex items-center gap-x-2 p-2 cursor-pointer select-none hover:bg-neutral-200 group-open:bg-neutral-200 dark:hover:bg-neutral-900 group-open:dark:bg-neutral-900">
                    <span
                      class={[
                        "iconify",
                        item.icon ?? "ri--folder-line",
                        "w-4 h-4",
                      ].join(" ")}
                      data-inline="false"
                    />
                    <span>{item.title}</span>
                    <span
                      class="iconify ri--arrow-down-s-line group-open:rotate-180 w-4 h-4 ml-auto"
                      data-inline="false"
                    />
                  </summary>
                  <ul class="flex flex-col pl-2 my-1">
                    {item.submenu.map(([href, title]) => (
                      <li class="border-l">
                        <A
                          href={href}
                          class="flex items-center gap-x-2 w-full p-2 hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900 text-sm"
                        >
                          <span
                            class="iconify ri--link w-4 h-4"
                            data-inline="false"
                          />
                          <span>{title}</span>
                        </A>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <A
                  href={item.href}
                  class={clsx(
                    "flex items-center gap-x-2 w-full p-2 hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900",
                    {
                      "bg-neutral-200 dark:bg-neutral-900":
                        item.isActive || router?.path === item.href,
                    }
                  )}
                >
                  <span
                    class={[
                      "iconify",
                      item.icon ?? "ri--arrow-drop-right-line",
                      "w-4 h-4",
                    ].join(" ")}
                    data-inline="false"
                  />
                  <span>{item.title}</span>
                </A>
              )}
            </li>
          ))}
        </menu>
        <div class="flex flex-col gap-y-1 border-t p-2">
          <A
            href="/admin/settings"
            class={clsx(
              "flex items-center gap-x-2 w-full p-2 hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900",
              {
                "bg-neutral-200 dark:bg-neutral-900":
                  router?.path === "/admin/settings",
              }
            )}
          >
            <span class="iconify ri--settings-line w-4 h-4"></span>
            <span>Settings</span>
          </A>
          <a
            href="/api/auth/signout?redirect_to=/"
            class="flex items-center gap-x-2 w-full p-2 hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900"
          >
            <span class="iconify ri--logout-box-line w-4 h-4"></span>
            <span>Signout</span>
          </a>
        </div>
      </aside>
      <label
        for="admin-aside"
        class="flex items-center justify-center w-1 cursor-pointer"
      >
        <div
          role="button"
          title="Collapse Menu"
          class="flex items-center justify-center cursor-pointer text-primary-500/80 w-6 h-6 rounded-full hover:transition hover:scale-105"
        >
          <span class="iconify ri--arrow-left-wide-line rotate-180 md:rotate-0 group-has-[input[id=admin-aside]:checked]/admin:rotate-0 md:group-has-[input[id=admin-aside]:checked]/admin:rotate-180 w-6 h-6"></span>
          <span class="sr-only">{"<<"}</span>
        </div>
      </label>
      <div class="flex-1 overflow-hidden py-2 px-0 md:px-2 group-has-[input[id=admin-aside]:checked]/admin:px-2 md:group-has-[input[id=admin-aside]:checked]/admin:px-0">
        {children}
      </div>
    </>
  );
};

export default AdminLayout;
