import type { PageMeta } from "@/lib/renderer";
import AppLayout from "@/ui/layouts/app";

export const meta: PageMeta = {
  title: "Home Page",
}

export default function Page() {
  return (
    <AppLayout>
      {/* Create HomePage */}
      <h1>This is HomePage</h1>
      <a href="/admin" class="text-blue-500">
        Go To Admin Page (auth)
      </a>
    </AppLayout>
  );
}
