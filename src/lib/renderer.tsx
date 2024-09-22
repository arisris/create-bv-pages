import { type JSX, type Child } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";
import type { Env, Input, Handler, Context } from "hono";
import type { BlankInput } from "hono/types";
import type { HtmlEscapedString } from "hono/utils/html";

type RendererProps = {
  lang?: string;
  bodyProps?: JSX.IntrinsicElements["body"];
  slotScripts?: Child;
  headTags?: Child;
  title?: string;
  description?: string;
};

declare module "hono" {
  interface ContextRenderer {
    (content: Child, props?: RendererProps): Response | Promise<Response>;
  }
}

export const createRootRenderer = (
  options?: Parameters<typeof jsxRenderer>[1]
) => {
  return jsxRenderer(
    ({ children, ...props }) => {
      return (
        <html lang={props.lang ?? "en"}>
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            {props.title && <title>{props.title}</title>}
            {props.description && (
              <meta name="description" content={props.description} />
            )}
            {props.headTags}
          </head>
          <body {...(props.bodyProps ?? {})}>
            {children}
            {props.slotScripts}
          </body>
        </html>
      );
    },
    { stream: true, docType: true, ...options }
  );
};

export type PageMeta =
  | ((ctx: Context) => RendererProps | Promise<RendererProps>)
  | RendererProps;
type PageComponent<
  Params extends Record<string, unknown> = Record<string, unknown>
> = (props: {
  params: Params;
}) => HtmlEscapedString | Promise<HtmlEscapedString>;

interface Page {
  meta?: PageMeta;
  default: PageComponent;
}

export const renderPage =
  <E extends Env = any, P extends string = any, I extends Input = BlankInput>(
    pageModule: () => Promise<Page> | Page
  ): Handler<E, P, I> =>
  async (ctx, _next) => {
    const page = await pageModule();
    let rendererProps: RendererProps = {};
    if (typeof page.meta === "object") {
      rendererProps = page.meta;
    } else if (typeof page.meta === "function") {
      rendererProps = await page.meta(ctx);
    }
    const Page = page.default;
    return ctx.render(<Page params={ctx.req.param()} />, rendererProps);
  };
