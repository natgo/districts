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
import { z } from "zod";

const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
})
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

      const code = Math.floor(100000 + Math.random() * 900000);

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
        userName: t.String({ maxLength: 32, minLength: 4 }),
      }),
      type: "application/json",
    }
  )
  .post(
    "/api/createUser",
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

      return "OK";
    },
    {
      body: t.Object({
        userName: t.String({ maxLength: 32 }),
      }),
      type: "application/json",
    }
  )
  .ws("/api/ws", {
    body: t.Union([
      t.Object({ guess: t.String({ maxLength: 100 }) }),
      t.Object({ start: t.Literal(true) }),
    ]),
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

    async open(ws) {
      console.log("opened");
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
      if (dbLobbyMatch) {
        const user = userZodSchema.parse(dbUserMatch);
        if (dbLobbyMatch.creator !== user.sessionID) {
          const members = z.array(z.string()).parse(dbLobbyMatch.members);
          // TODO: don't push multiple of the same session
          members.push(user.userName);
          dbLobbyMatch.members = members;

          await lobbyRepo.save(dbLobbyMatch);
        } else {
          ws.send({ creator: true });
        }

        ws.send({ members: dbLobbyMatch.members });

        ws.subscribe(ws.data.query.code);
        ws.publish(ws.data.query.code, { join: user.userName });
      }
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

      const lobby = lobbyZodSchema.parse(dbLobbyMatch);
      if (dbUserMatch) {
        const user = userZodSchema.parse(dbUserMatch);
        if ("start" in message) {
          if (user.sessionID === lobby.creator) {
            ws.publish(ws.data.query.code, { start: true });
          }
        } else {
          if (message.guess === lobby.currentDistrict) {
            typeof dbUserMatch.score === "number" ? dbUserMatch.score++ : 1;
          }
          await userRepo.save(dbUserMatch);
          ws.publish(ws.data.query.code, { locked: user.userName });
        }
      }
    },

    async close(ws) {
      console.log("close");

      const dbUserMatch = await userRepo
        .search()
        .where("sessionID")
        .equals(ws.data.cookie.sessionID.get())
        .return.first();
      if (dbUserMatch) {
        const user = userZodSchema.parse(dbUserMatch);

        dbUserMatch.code = undefined;
        dbUserMatch.score = undefined;
        await userRepo.save(dbUserMatch);

        app.server?.publish(
          ws.data.query.code,
          JSON.stringify({ left: user.userName })
        );
      }
      ws.unsubscribe(ws.data.query.code);
      // TODO: remove from lobby on db
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
