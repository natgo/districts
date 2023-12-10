import { createSignal } from "solid-js";

import type { Properties } from "@/utils/types/geojson.types";
import type { User } from "@/utils/types/returnType";
import type { Layer } from "leaflet";

type UserWithScore = User & { score: number };

const [showLobby, setShowLobby] = createSignal(true);
const [members, setMembers] = createSignal<User[] | UserWithScore[]>([]);
const [host, setHost] = createSignal(false);
const [score, setScore] = createSignal<number | undefined>(0);
const [selected, setSelected] = createSignal<Layer>();
const [corrects, setCorrects] = createSignal<Properties[]>([]);

export {
  showLobby,
  setShowLobby,
  members,
  setMembers,
  host,
  setHost,
  score,
  setScore,
  selected,
  setSelected,
  corrects,
  setCorrects,
};
