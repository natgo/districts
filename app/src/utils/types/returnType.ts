import { z } from "zod";

const userZ = z.object({
  userName: z.string(),
  userID: z.string().uuid(),
  host: z.literal(true).optional(),
});
export type User = z.infer<typeof userZ>;

// Happens on game start
const startZ = z.object({
  start: z.literal(true),
});

// Happens when someone disconnects
const disconnectZ = z.object({
  left: userZ,
});

// Happens every time someone locks a answer
const lockedZ = z.object({
  locked: userZ,
});

// Happens when someone joins lobby
const joinZ = z.object({
  // TODO: add host attribute
  join: userZ,
});

// Happens when the game questions are over
const endGameZ = z.object({
  stats: z.array(
    z.object({
      userName: z.string(),
      userID: z.string().uuid(),
      score: z.number(),
    }),
  ),
});

const nextZ = z.object({
  next: z.number(), // ID
});

// Happens when time on question runs out
const timeOverZ = z.object({
  currentStats: z.array(userZ.extend({ score: z.number() })),
});

// Happens when joining lobby
const membersZ = z.object({
  members: z.array(userZ),
  you: z.string().uuid(), // userID
});
const creatorZ = z.object({
  creator: z.literal(true),
});

const WSReturnType = z.union([
  startZ,
  disconnectZ,
  joinZ,
  lockedZ,
  endGameZ,
  nextZ,
  timeOverZ,
  membersZ,
  creatorZ,
]);

export {
  userZ,
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
