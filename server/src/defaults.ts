import Elysia from "elysia";

export const defaults = (app: Elysia) =>
  app.onAfterHandle(({ set }) => {
    set.headers["x-powered-by"] = "Elysia";
  });
