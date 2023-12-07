import { createSignal } from "solid-js";

import type { Properties } from "@/utils/types/geojson.types";
import type { Layer } from "leaflet";

const [showLobby, setShowLobby] = createSignal(true);
const [members, setMembers] = createSignal<string[]>([]);
const [host, setHost] = createSignal(false);
const [score, setScore] = createSignal(0);
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
