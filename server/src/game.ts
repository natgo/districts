import { app } from ".";

import { lobbyRepo, lobbyZodSchema } from "./db";
import { delay } from "./delay";

export async function gameLoop(
  lobbyCodeStr: string,
  dbLobbyKey: string,
  districts: number[]
) {
  for (const district of districts) {
    await delay(3000);
    await setDistrict(lobbyCodeStr, dbLobbyKey, district);
  }

  const finalLobbyMatch = await lobbyRepo.fetch(dbLobbyKey);
  const finalLobby = lobbyZodSchema.parse(finalLobbyMatch);
  app.server?.publish(
    lobbyCodeStr,
    JSON.stringify({
      stats: finalLobby.userIDs.map((userID, index) => {
        return {
          userID: userID,
          userName: finalLobby.members.at(index) ?? "ENONAME",
          score: finalLobby.scores.at(index) ?? 0,
          host: finalLobby.creator === userID ? true : undefined,
        };
      }),
    })
  );
}

export async function setDistrict(
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
  dbLobbyMatch.currentTimestamp = Date.now();

  await lobbyRepo.save(dbLobbyMatch);

  await delay(10000);
  const freshDBLobbyMatch = await lobbyRepo.fetch(dbLobbyKey);
  const freshLobby = lobbyZodSchema.parse(freshDBLobbyMatch);
  app.server?.publish(
    lobbyCodeStr,
    JSON.stringify({
      currentStats: freshLobby.userIDs.map((userID, index) => {
        return {
          userID: userID,
          userName: freshLobby.members.at(index) ?? "ENONAME",
          score: freshLobby.scores.at(index) ?? 0,
          host: lobby.creator === userID ? true : undefined,
        };
      }),
    })
  );
}
