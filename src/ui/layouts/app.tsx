import type { Child, FC, PropsWithChildren } from "hono/jsx";
import clsx from "clsx";

type MenuItem = {
  title: string;
  href?: string;
  submenu?: Omit<MenuItem, "submenu">[];
};

const AppLayout: FC<
  PropsWithChildren<{
    noParent?: boolean;
    menuItems?: MenuItem[];
    mainClass?: string;
    parentClass?: string;
    searchForm?: Child;
  }>
> = ({ children, ...props }) => {
  const menuItems: MenuItem[] = [
    {
      title: "Apps",
      submenu: [
        {
          title: "Counter",
          href: "/apps/counter",
        },
        {
          title: "Todo",
          href: "/apps/todo",
        },
      ],
    },
    {
      title: "Docs",
      submenu: [
        {
          title: "Getting Started",
          href: "/docs/getting-started",
        },
        {
          title: "Configuration",
          href: "/docs/configuration",
        },
        {
          title: "Deploy",
          href: "/docs/deploy",
        },
      ],
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Blog",
      href: "/blog",
    },
    ...(props.menuItems || []),
  ];
  return (
    <section class="flex flex-col min-h-screen">
      <header class="relative block border-b">
        <nav class="group max-w-screen-lg mx-auto flex flex-col md:items-center md:flex-row md:justify-between">
          <div class="flex items-center gap-x-4 px-4 py-2 md:p-2 md:flex-grow">
            <a href="/" class="flex flex-col items-center px-2 md:py-2">
              <strong class="block text-xl md:hidden">{"<AR/>"}</strong>
              <strong class="hidden md:block text-2xl underline text-nowrap">
                {"🔥hono"}
              </strong>
              <span class="hidden md:block text-[.5rem] italic ml-auto -mt-1">
                By Arisris
              </span>
            </a>
            {props.searchForm === true ? (
              <form class="flex-1 lg:mx-4 flex items-center rounded border hover:ring-1 overflow-hidden">
                <input
                  type="search"
                  name="search"
                  id="search"
                  placeholder="Search"
                  autocomplete="off"
                  class="w-full appearance-none outline-none bg-transparent p-2 text-xs placeholder:text-xs placeholder:italic placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  class="flex items-center p-2 text-neutral-500"
                >
                  <span class="iconify ri--search-line w-5 h-5"></span>
                  <span class="sr-only">Search</span>
                </button>
              </form>
            ) : (
              props.searchForm
            )}
            <label
              for="nav-toggle"
              role="button"
              class="ml-auto inline-flex items-center justify-start w-6 h-6 md:hidden select-none"
            >
              <span class="iconify ri--menu-fill group-has-[input[id=nav-toggle]:checked]:ri--close-large-fill w-6 h-6"></span>
              <span class="sr-only">Toggle Menu</span>
            </label>
          </div>
          <input id="nav-toggle" type="checkbox" class="hidden peer" />
          <div class="flex flex-col md:flex-row gap-4 bg-inherit md:px-4 transition-[height] duration-300 h-0 peer-checked:h-[92vh] md:h-auto md:peer-checked:checked:h-auto max-md:overflow-hidden">
            <ul class="flex flex-col md:flex-row">
              {menuItems.map((item) =>
                item.submenu ? (
                  <li class="relative flex flex-col">
                    <details class="group" data-closable>
                      <summary class="cursor-pointer flex justify-between items-center gap-x-1 px-4 py-2 select-none hover:rounded hover:bg-neutral-200 group-open:bg-neutral-200 dark:hover:bg-neutral-900 group-open:dark:bg-neutral-900">
                        {item.title}
                        <span class="iconify ri--arrow-drop-down-line group-open:rotate-180 w-6 h-6" />
                      </summary>
                      <ul class="hidden group-open:block md:group-open:absolute md:group-open:z-10 p-2 md:right-2 md:top-11 md:w-48 md:rounded md:border md:bg-neutral-100 dark:bg-neutral-950">
                        {item.submenu.map((child, index) => (
                          <li tabindex={index}>
                            <a
                              href={child.href}
                              class="block px-4 py-2 md:text-sm hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900"
                            >
                              {child.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li>
                    {item.href ? (
                      <a
                        href={item.href}
                        class="block px-4 py-2 hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span class="block px-4 py-2 hover:rounded hover:bg-neutral-200 dark:hover:bg-neutral-900">
                        {item.title}
                      </span>
                    )}
                  </li>
                )
              )}
            </ul>
          </div>
        </nav>
      </header>
      <main class={clsx("flex-auto", props.mainClass)}>
        {props.noParent ? (
          children
        ) : (
          <div class={clsx("max-w-screen-lg mx-auto p-2", props.parentClass)}>
            {children}
          </div>
        )}
      </main>
      <footer class="border-t">
        <div class="max-w-screen-lg mx-auto flex flex-col-reverse md:flex-row md:items-center md:justify-between p-4 gap-8">
          <div class="flex items-center justify-between flex-grow gap-x-8">
            <div class="flex items-center flex-nowrap text-nowrap gap-x-2">
              <span>&copy;{new Date().getFullYear()}</span>
              <a
                href="https://github.com/arisris/arisris.com"
                class="hover:underline"
              >
                Aris Riswanto
              </a>
            </div>
            <div class="flex items-center gap-x-4">
              {[
                ["ri--github-fill", "https://github.com/arisris", "Github"],
                [
                  "ri--linkedin-fill text-blue-500",
                  "https://linkedin.com/in/arisris",
                  "LinkedIn",
                ],
                [
                  "ri--facebook-fill text-blue-600",
                  "https://facebook.com/arisfungratis",
                  "Facebook",
                ],
              ].map(([icon, href, title]) => (
                <a
                  href={href}
                  title={title}
                  class="flex items-center hover:underline hover:scale-105"
                >
                  <span class={clsx("iconify w-6 h-6", icon)} />
                  <span class="sr-only">{title}</span>
                </a>
              ))}
            </div>
          </div>
          <div class="flex items-start md:items-center md:flex-row-reverse justify-between text-nowrap gap-x-8">
            <ul class="flex flex-col md:flex-row md:items-center gap-x-4">
              <li>
                <a href="/pages/privacy-policy" class="hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/pages/terms-of-service" class="hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/pages/disclaimer" class="hover:underline">
                  Disclaimer
                </a>
              </li>
            </ul>
            <button
              type="button"
              title="Toggle Theme"
              id="toggle-theme"
              class="flex items-center justify-center rounded-full"
            >
              <span class="iconify dark:ri--sun-line ri--moon-line dark:text-yellow-500 w-6 h-6 group-hover:scale-105"></span>
              <span class="sr-only">Toggle Theme</span>
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default AppLayout;
