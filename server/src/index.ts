import { Elysia, t } from "elysia";
import { defaults } from "./defaults";
import {
  LobbySchema,
  UserSchema,
  lobbyRepo,
  lobbyZodSchema,
  userRepo,
  userZodSchema,
} from "./db";
import { Entity } from "redis-om";

const app = new Elysia()
  .use(defaults)
  .get("/", () => "Hello Elysia")
  .post(
    "/api/createLobby",
    ({ cookie: { sessionID }, body }) => {
      const session = crypto.randomUUID();
      const user: UserSchema = {
        userName: body.userName,
        sessionID: session,
      };
      userRepo.save(userZodSchema.parse(user));
      sessionID?.set({
        domain: "localhost",
        httpOnly: true,
        path: "/",
        value: session,
      });

      const code = Math.ceil(Math.random() * 1000000);

      const lobby: LobbySchema = {
        code: code,
        creator: session,
        members: [],
      };
      lobbyRepo.save(lobbyZodSchema.parse(lobby));
      return code.toString();
    },
    {
      body: t.Object({
        userName: t.String({ maxLength: 32 }),
      }),
      type: "application/json",
    }
  )
  .ws("/api/ws", {
    body: t.Object({ guess: t.String({ maxLength: 100 }) }),
    query: t.Object({ code: t.String() }),
    cookie: t.Cookie({ sessionID: t.String() }),

    beforeHandle: async ({ cookie, query }) => {
      const dbSessionMatch = await userRepo
        .search()
        .where("sessionID")
        .equals(cookie.sessionID.get())
        .return.first();
      console.log(dbSessionMatch);
      const dbLobbyMatch = await lobbyRepo
        .search()
        .where("code")
        .equals(query.code)
        .return.first();

      if (dbSessionMatch && dbLobbyMatch) {
        console.log(dbSessionMatch, dbLobbyMatch);
      } else {
        return "Unauthorized";
      }
    },

    open(ws) {
      ws.send("opened");
      ws.subscribe(ws.data.query.code);
    },

    async message(ws, message) {
      const dbLobbyMatch = await lobbyRepo
        .search()
        .where("code")
        .equals(ws.data.query.code)
        .return.first();
      const dbUserMatch = await userRepo
        .search()
        .where("sessionID")
        .equals(ws.data.cookie.sessionID.get())
        .return.first();

      const lobbyStatus = lobbyZodSchema.parse(dbLobbyMatch);
      if (dbUserMatch) {
        const user = userZodSchema.passthrough().parse(dbUserMatch);

        if (message.guess === lobbyStatus.currentDistrict) {
          user.score ? user.score++ : 1;
        }
        await userRepo.save(user);
        ws.publish(ws.data.query.code, { locked: user.userName });
      }
    },

    async close(ws) {
      ws.unsubscribe(ws.data.query.code);
      const dbUserMatch = await userRepo
        .search()
        .where("sessionID")
        .equals(ws.data.cookie.sessionID.get())
        .return.first();
      if (dbUserMatch) {
        const user = userZodSchema.passthrough().parse(dbUserMatch);
        user.code = undefined;
        user.score = undefined;
        await userRepo.save(user);
        ws.publish(ws.data.query.code, { left: user.userName });
      }

      // TODO: remove from lobby
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
