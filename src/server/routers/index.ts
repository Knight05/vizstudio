import { router } from "../trpc";
import { chartsRouter } from "./charts";
import { billingRouter } from "./billing";
import { userRouter } from "./user";

export const appRouter = router({
  charts: chartsRouter,
  billing: billingRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
