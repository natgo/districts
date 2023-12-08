import { Elysia, MergeSchema, UnwrapRoute, t } from "elysia";
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
import kaupunginosat from "./kaupunginosat.json";
import shuffle from "./shuffle";
import { DateTime } from "luxon";
import { Entity } from "redis-om";
import { TSchema, TUnion, TObject, TString, TLiteral } from "@sinclair/typebox";
import { ServerWebSocket } from "bun";
import { TypeCheck } from "elysia/dist/type-system";
import { ElysiaWS } from "elysia/dist/ws";
const games: {
  code: number;
  districts: number[];
  stats: { score: number; userName: string }[];
}[] = [];

async function setDistrict(
  ws: ElysiaWS<
    ServerWebSocket<{ validator?: TypeCheck<TSchema> | undefined }>,
    MergeSchema<
      UnwrapRoute<
        {
          body: TUnion<
            [TObject<{ guess: TString }>, TObject<{ start: TLiteral<true> }>]
          >;
          query: TObject<{ code: TString }>;
          cookie: TObject<{ sessionID: TString }>;
          beforeHandle: unknown;
          open: unknown;
          message: unknown;
          close: unknown;
        },
        {}
      >,
      {
        body: unknown;
        headers: unknown;
        query: unknown;
        params: unknown;
        cookie: unknown;
        response: unknown;
      }
    > & { params: Record<never, string> },
    { request: {}; store: {} }
  >,
  dbLobbyMatch: Entity,
  districts: number[]
) {
  const date = DateTime.now().plus({ seconds: 20 });
  app.server?.publish(
    ws.data.query.code,
    JSON.stringify({
      next: districts[0],
    })
  );
  setTimeout(() => {
    app.server?.publish(
      ws.data.query.code,
      JSON.stringify({
        currentStats: games.find(
          (value) => value.code.toString() === ws.data.query.code
        )?.stats,
      })
    );
  }, date.diffNow().milliseconds);
  dbLobbyMatch.currentDistrict = districts[0];
  dbLobbyMatch.timeLeft = date.toJSDate();

  await lobbyRepo.save(dbLobbyMatch);
}

const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
})
  .use(defaults)
  .get("/", () => "Hello Elysia")
  .post(
    "/api/createLobby",
    ({ cookie: { sessionID }, body, set }) => {
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
        // TODO: remove from prod
        sameSite: "none",
        secure: true,
      });
      set.headers["Access-Control-Allow-Credentials"] = "true";

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
    ({ cookie: { sessionID }, body, set }) => {
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
        // TODO: remove from prod
        sameSite: "none",
        secure: true,
      });
      set.headers["Access-Control-Allow-Credentials"] = "true";

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

      if (dbUserMatch && dbLobbyMatch) {
        const lobby = lobbyZodSchema.parse(dbLobbyMatch);
        const user = userZodSchema.parse(dbUserMatch);
        if ("start" in message) {
          if (user.sessionID === lobby.creator) {
            const districts = shuffle(
              kaupunginosat.features.map((value) => value.properties.id)
            );
            games.push({
              code: lobby.code,
              districts: kaupunginosat.features.map(
                (value) => value.properties.id
              ),
              stats: lobby.members.map((member) => {
                return { userName: member, score: 0 };
              }),
            });
            setDistrict(ws, dbLobbyMatch, districts);

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
