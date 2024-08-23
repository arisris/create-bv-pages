import type {} from "hono";
import { type JSX, type Child } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";
import { getDarkModeScript, getAsset } from "@/lib/util";
import { every } from "hono/combine";
import { raw } from "hono/html";

type RendererProps = {
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
  return every(
    jsxRenderer(
      ({ children, ...props }) => {
        return (
          <html lang="en">
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
              <link rel="stylesheet" href={getAsset("src/ui/tailwind.css")} />
              {props.headTags}
              <script>{raw(getDarkModeScript())}</script>
            </head>
            <body {...(props.bodyProps ?? {})}>
              {children}
              <script type="module" src={getAsset("src/client.tsx")} />
              {props.slotScripts}
            </body>
          </html>
        );
      },
      { stream: true, docType: true, ...options }
    )
  );
};
