import Elysia from "elysia";

export const defaults = (app: Elysia) =>
  app.onAfterHandle(({ set }) => {
    set.headers["x-powered-by"] = "Elysia";
    // TODO: change for deployment
    set.headers["Access-Control-Allow-Origin"] = "http://localhost:4321";
  });
