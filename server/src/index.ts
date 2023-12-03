import { Elysia, t } from "elysia";
import { defaults } from "./defaults";
import { userRepo } from "./db";

const app = new Elysia()
  .use(defaults)
  .get("/", () => "Hello Elysia")
  .post("/api/createlobby", () => "02192", {
    body: t.Object({
      UserName: t.String({ maxLength: 32 }),
    }),
    type: "application/json",
  })
  .ws("/api/ws", {
    body: t.String({ maxLength: 4096 }),

    open(ws) {
      ws.send("opened");
    },

    beforeHandle: ({ cookie }) => {
      userRepo
        .search()
        .where("sessionID")
        .equals(cookie.sessionID.get())
        .return.first()
        .then((dbMatch) => {
          console.log(dbMatch);

          if (dbMatch) {
            console.log(dbMatch);
          } else {
            return "Unauthorized";
          }
        });
    },
    cookie: t.Cookie({ sessionID: t.String() }),
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
