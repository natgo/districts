import { createClient } from "redis";
import { Schema } from "redis-om";
import { Repository } from "redis-om";
import { z } from "zod";

const redis = createClient({
  url: `redis://${process.env.DB_HOST}`,
});
redis.on("error", (err) => console.log("Redis Client Error", err));
await redis.connect();

const userRedisSchema = new Schema("user", {
  userName: { type: "string" },
  userID: { type: "string" },
  sessionID: { type: "string" },
  code: { type: "number" },
});

export const userZodSchema = z.object({
  userName: z.string(),
  userID: z.string().uuid(),
  sessionID: z.string().uuid(),
  code: z.number().optional(),
});
export type UserSchema = z.infer<typeof userZodSchema>;

const lobbyRedisSchema = new Schema("lobby", {
  code: { type: "string" },
  creator: { type: "string" }, // userID
  members: { type: "string[]" }, // userName
  userIDs: { type: "string[]" }, // userID
  scores: { type: "number[]" },
  currentDistrict: { type: "number" },
  currentTimestamp: { type: "number" },
});

export const lobbyZodSchema = z.object({
  code: z.string().length(6),
  creator: z.string().uuid(),
  members: z.string().array(),
  userIDs: z.string().uuid().array(),
  scores: z.number().array(),
  currentDistrict: z.number().optional(),
  currentTimestamp: z.number().optional(),
});
export type LobbySchema = z.infer<typeof lobbyZodSchema>;

export const userRepo = new Repository(userRedisSchema, redis);
export const lobbyRepo = new Repository(lobbyRedisSchema, redis);

await userRepo.createIndex();
await lobbyRepo.createIndex();
