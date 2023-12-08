import { z } from "zod";

// Happens on game start
const startZ = z.object({
  start: z.literal(true),
});

// Happens when someone disconnects
const disconnectZ = z.object({
  left: z.string(), //UserName
});

// Happens every time someone locks a answer
const lockedZ = z.object({
  locked: z.string(), // UserName
});

// Happens when someone joins lobby
const joinZ = z.object({
  join: z.string(), // UserName
});

// Happens when the game questions are over
const endGameZ = z.object({
  stats: z.array(
    z.object({
      userName: z.string(),
      score: z.number(),
    }),
  ),
});

const nextZ = z.object({
  next: z.string(), // nimi_fi
});

// Happens when time on question runs out
const timeOverZ = z.object({
  correct: z.boolean(),
  currentStats: z.array(
    z.object({
      userName: z.string(),
      score: z.number(),
    }),
  ),
});

// Happens when joining lobby
const membersZ = z.object({
  members: z.array(z.string()),
});
const creatorZ = z.object({
  creator: z.literal(true),
});

const WSReturnType = z.union([startZ, disconnectZ, lockedZ, joinZ, endGameZ, membersZ, creatorZ]);

export {
  startZ,
  disconnectZ,
  joinZ,
  lockedZ,
  endGameZ,
  nextZ,
  timeOverZ,
  membersZ,
  creatorZ,
  WSReturnType,
};
