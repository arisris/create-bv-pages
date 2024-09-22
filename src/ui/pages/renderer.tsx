import { getAsset, getDarkModeScript } from "@/lib/util";
import { jsxRenderer } from "hono/jsx-renderer";

export default function pageRenderer() {
  return jsxRenderer(({ Layout, ...props }) => {
    props.headTags = (
      <>
        {props.headTags}
        <link rel="stylesheet" href={getAsset("src/ui/tailwind.css")} />
        <script dangerouslySetInnerHTML={{ __html: getDarkModeScript() }} />
      </>
    );
    props.slotScripts = (
      <>
        {props.slotScripts}
        <script type="module" src={getAsset("src/ui/client.ts")} />
      </>
    );
    return <Layout {...props} />;
  });
}
