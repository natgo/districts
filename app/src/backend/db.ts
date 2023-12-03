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
});

export const userZodSchema = z.object({ userName: z.string(), sessionID: z.string().uuid() });
export type UserSchema = z.infer<typeof userZodSchema>;

const lobbyRedisSchema = new Schema("lobby", {
  code: { type: "number" },
  creator: { type: "string" }, // SessionID
  members: { type: "string[]" }, // SessionID
});

export const lobbyZodSchema = z.object({
  code: z.number(),
  creator: z.string().uuid(),
  members: z.string().uuid().array(),
});

const lobbyStatusRedisSchema = new Schema("lobbyStatus", {
  code: { type: "number" },
  currentDistrict: { type: "string" },
  timeLeft: { type: "date" },
  members: { type: "string[]" }, // SessionID
});

export const lobbyStatusZodSchema = z.object({
  code: z.number(),
  currentDistrict: z.string(),
  timeLeft: z.date(),
  members: z.string().uuid().array(),
});

const scoreRedisSchema = new Schema("score", {
  code: { type: "number" },
  correct: { type: "number" },
  wrong: { type: "number" },
  members: { type: "string[]" }, // SessionID
});

export const scoreZodSchema = z.object({
  code: z.number(),
  correct: z.number(),
  wrong: z.number(),
  members: z.string().uuid().array(),
});

export const userRepo = new Repository(userRedisSchema, redis);
export const lobbyRepo = new Repository(lobbyRedisSchema, redis);
export const lobbyStatusRepo = new Repository(lobbyStatusRedisSchema, redis);
export const scoreRepo = new Repository(scoreRedisSchema, redis);
