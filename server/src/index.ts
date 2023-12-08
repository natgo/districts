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
import kaupunginosat from "./kaupunginosat.json";
import shuffle from "./shuffle";
import { Entity, EntityId } from "redis-om";

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function setDistrict(
  lobbyCodeStr: string,
  dbLobbyKey: string,
  district: number
) {
  app.server?.publish(
    lobbyCodeStr,
    JSON.stringify({
      next: district,
    })
  );
  const dbLobbyMatch = await lobbyRepo.fetch(dbLobbyKey);
  const lobby = lobbyZodSchema.parse(dbLobbyMatch);

  dbLobbyMatch.currentDistrict = district;

  await lobbyRepo.save(dbLobbyMatch);

  await delay(20000);
  const newDBLobbyMatch = await lobbyRepo.fetch(dbLobbyKey);
  const newLobby = lobbyZodSchema.parse(newDBLobbyMatch);
  app.server?.publish(
    lobbyCodeStr,
    JSON.stringify({
      currentStats: newLobby.userIDs.map((userID, index) => {
        return {
          userID: userID,
          userName: newLobby.members.at(index) ?? "ENONAME",
          score: newLobby.scores.at(index) ?? 0,
        };
      }),
    })
  );
}

async function gameLoop(
  lobbyCodeStr: string,
  dbLobbyKey: string,
  districts: number[]
) {
  for (const district of districts) {
    await delay(3000);
    await setDistrict(lobbyCodeStr, dbLobbyKey, district);
  }
  console.log("does this log before game or after");
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
      const userID = crypto.randomUUID();
      const user: UserSchema = {
        userName: body.userName,
        userID: userID,
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
        creator: userID,
        members: [],
        userIDs: [],
        scores: [],
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
      const userID = crypto.randomUUID();
      const user: UserSchema = {
        userName: body.userName,
        sessionID: session,
        userID: userID,
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
        userName: t.String({ maxLength: 32, minLength: 4 }),
      }),
      type: "application/json",
    }
  )
  .ws("/api/ws", {
    body: t.Union([
      t.Object({ guess: t.Number({ maxLength: 100 }) }),
      // TODO: add ability to use other modes
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
        console.log("passed auth");
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
        const members = z.string().array().parse(dbLobbyMatch.members);
        const userIDs = z.string().uuid().array().parse(dbLobbyMatch.userIDs);
        const scores = z.number().array().parse(dbLobbyMatch.scores);
        if (dbLobbyMatch.creator !== user.userID) {
          // TODO: don't push multiple of the same session
          members.push(user.userName);
          userIDs.push(user.userID);
          scores.push(0);
          dbLobbyMatch.members = members;
          dbLobbyMatch.userIDs = userIDs;
          dbLobbyMatch.scores = scores;

          await lobbyRepo.save(dbLobbyMatch);
        } else {
          ws.send({ creator: true });
        }

        ws.send({
          members: userIDs.map((userID, index) => {
            return { userName: members.at(index) ?? "ENONAME", userID: userID };
          }),
          you: user.userID,
        });

        ws.subscribe(ws.data.query.code);
        ws.publish(ws.data.query.code, {
          join: { userName: user.userName, userID: user.userID },
        });
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
          if (user.userID === lobby.creator) {
            const districts = shuffle(
              kaupunginosat.features.map((value) => value.properties.id)
            );

            ws.publish(ws.data.query.code, { start: true });
            gameLoop(ws.data.query.code, dbLobbyMatch[EntityId], districts);
          }
        } else {
          if (message.guess === lobby.currentDistrict && dbLobbyMatch) {
            const index = lobby.userIDs.findIndex(
              (userID) => user.userID === userID
            );

            dbLobbyMatch.scores[index]++;

            await lobbyRepo.save(dbLobbyMatch);
          }
          console.log(user.userName, lobby.currentDistrict, message.guess);

          ws.publish(ws.data.query.code, {
            locked: { userName: user.userName, userID: user.userID },
          });
        }
      }
    },

    async close(ws) {
      console.log("close");

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
        const user = userZodSchema.parse(dbUserMatch);
        const lobby = lobbyZodSchema.parse(dbLobbyMatch);

        const index = lobby.userIDs.findIndex(
          (userID) => user.userID === userID
        );
        const userIDs = lobby.userIDs.toSpliced(index, 1);
        const members = lobby.members.toSpliced(index, 1);
        const scores = lobby.scores.toSpliced(index, 1);

        dbLobbyMatch.userIDs = userIDs;
        dbLobbyMatch.members = members;
        dbLobbyMatch.scores = scores;

        dbUserMatch.code = undefined;
        await userRepo.save(dbUserMatch);
        await lobbyRepo.save(dbLobbyMatch);

        app.server?.publish(
          ws.data.query.code,
          JSON.stringify({
            left: { userName: user.userName, userID: user.userID },
          })
        );
      }
      ws.unsubscribe(ws.data.query.code);
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
