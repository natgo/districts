import { createClient } from "redis";
import { Schema } from "redis-om";
import { Repository } from "redis-om";
import { z } from "zod";

const redis = createClient();
redis.on("error", (err) => console.log("Redis Client Error", err));
await redis.connect();

const userRedisSchema = new Schema("user", {
  userName: { type: "string" },
  sessionID: { type: "string" },
  code: { type: "number" },
  score: { type: "number" },
});

export const userZodSchema = z.object({
  userName: z.string(),
  sessionID: z.string().uuid(),
  code: z.number().optional(),
  score: z.number().optional(),
});
export type UserSchema = z.infer<typeof userZodSchema>;

const lobbyRedisSchema = new Schema("lobby", {
  code: { type: "number" },
  creator: { type: "string" }, // SessionID
  members: { type: "string[]" }, // SessionID
  currentDistrict: { type: "string" },
  timeLeft: { type: "date" },
});

export const lobbyZodSchema = z.object({
  code: z.number(),
  creator: z.string().uuid(),
  members: z.string().uuid().array(),
  currentDistrict: z.string().optional(),
  timeLeft: z.date().optional(),
});
export type LobbySchema = z.infer<typeof lobbyZodSchema>;

export const userRepo = new Repository(userRedisSchema, redis);
export const lobbyRepo = new Repository(lobbyRedisSchema, redis);

await userRepo.createIndex();
await lobbyRepo.createIndex();
