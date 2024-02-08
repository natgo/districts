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

import kaupunginosat from "./assets/kaupunginosat.json";
import osaalueet from "./assets/osaalueet.json";
import peruspiirit from "./assets/peruspiirit.json";
import pienalueet from "./assets/pienalueet.json";
import postinumerot from "./assets/postinumerot.json";
import suurpiirit from "./assets/suurpiirit.json";

import shuffle from "./shuffle";
import { EntityId } from "redis-om";
import { gameLoop } from "./game";

export const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
})
  .use(defaults)
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
        sameSite: "strict",
        secure: true,
      });

      const code = crypto
        .getRandomValues(new Uint16Array(6))
        .join("")
        .slice(-6);
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
        sameSite: "strict",
        secure: true,
      });

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

      t.Object({
        start: t.Union([
          t.Literal("kaupunginosat"),
          t.Literal("osaalueet"),
          t.Literal("pienalueet"),
          t.Literal("peruspiirit"),
          t.Literal("suurpiirit"),
          t.Literal("postinumerot"),
        ]),
      }),
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
      const lobby = lobbyZodSchema.parse(dbLobbyMatch);
      if (dbLobbyMatch) {
        const user = userZodSchema.parse(dbUserMatch);
        const members = z.string().array().parse(dbLobbyMatch.members);
        const userIDs = z.string().uuid().array().parse(dbLobbyMatch.userIDs);
        const scores = z.number().array().parse(dbLobbyMatch.scores);

        if (dbLobbyMatch.creator === user.userID) {
          ws.send({ creator: true });
        }

        // TODO: don't push multiple of the same session
        members.push(user.userName);
        userIDs.push(user.userID);
        scores.push(0);
        dbLobbyMatch.members = members;
        dbLobbyMatch.userIDs = userIDs;
        dbLobbyMatch.scores = scores;

        await lobbyRepo.save(dbLobbyMatch);

        ws.send({
          members: userIDs.map((userID, index) => {
            return {
              userName: members.at(index) ?? "ENONAME",
              userID: userID,
              host: lobby.creator === userID ? true : undefined,
            };
          }),
          you: user.userID,
        });

        ws.subscribe(ws.data.query.code);
        ws.publish(ws.data.query.code, {
          join: {
            userName: user.userName,
            userID: user.userID,
            host: lobby.creator === user.userID ? true : undefined,
          },
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
            let districts;
            switch (message.start) {
              case "kaupunginosat":
                districts = shuffle(kaupunginosat.features);
                break;
              case "osaalueet":
                districts = shuffle(osaalueet.features);
                break;
              case "peruspiirit":
                districts = shuffle(peruspiirit.features);
                break;
              case "pienalueet":
                districts = shuffle(pienalueet.features);
                break;
              case "postinumerot":
                districts = shuffle(postinumerot.features);
                break;
              case "suurpiirit":
                districts = shuffle(suurpiirit.features);
                break;
            }

            ws.publish(ws.data.query.code, { start: message.start });
            gameLoop(
              ws.data.query.code,
              dbLobbyMatch[EntityId]!,
              districts.map((value) => value.properties.id)
            );
          }
        } else {
          if (
            message.guess === lobby.currentDistrict &&
            dbLobbyMatch &&
            dbLobbyMatch.scores &&
            lobby.currentTimestamp
          ) {
            const index = lobby.userIDs.findIndex(
              (userID) => user.userID === userID
            );

            dbLobbyMatch.scores[index] +=
              -0.01 * (Date.now() - lobby.currentTimestamp) + 100;

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
