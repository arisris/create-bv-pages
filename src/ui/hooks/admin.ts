import { useStore } from "../store";
import { $adminRouter } from "../store/router";

export const useAdminRouter = () => {
  const router = useStore($adminRouter);
  return {
    router: router,
    open: (href: string) => {
      $adminRouter.open(href);
    },
  };
};