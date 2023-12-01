import { z } from "zod";

export const types = z.enum([
  "kaupunginosat",
  "osaalueet",
  "pienalueet",
  "peruspiirit",
  "suurpiirit",
  "postinumerot",
  "vaalipiirit",
]);
export type Types = z.infer<typeof types>;
