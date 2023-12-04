import { z } from "zod";

const disconnect = z.object({
  left: z.string(), //UserName
});
const locked = z.object({
  locked: z.string(), // UserName
});
const join = z.object({
  join: z.string(), // UserName
});
const endGame = z.object({
  stats: z.array(
    z.object({
      userName: z.string(),
      score: z.number(),
    })
  ),
});
