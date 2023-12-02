import { createSignal } from "solid-js";

import type { GeoSchema, Properties, SignleFeature } from "@/utils/types/geojson.types";

const [geo, setGeo] = createSignal<GeoSchema>({
  type: "FeatureCollection",
  features: [],
  totalFeatures: 0,
  numberMatched: 0,
  numberReturned: 0,
  timeStamp: "",
  crs: { type: "name", properties: { name: "" } },
});

const [features, setFeatures] = createSignal<SignleFeature[]>([]);
const [current, setCurrent] = createSignal<Properties>();
const [guessed, setGuessed] = createSignal<Properties[]>([]);
const [wrong, setWrong] = createSignal<Properties[]>([]);
const [correct, setCorrect] = createSignal({ correct: 0, wrong: 0 });
const [status, setStatus] = createSignal(false);
const [win, setWin] = createSignal(false);
const [currText, setCurrText] = createSignal(1);

export function incrementCorrect() {
  setCorrect((prevValue) => {
    return { ...prevValue, correct: prevValue.correct + 1 };
  });
}
export function incrementWrong() {
  setCorrect((prevValue) => {
    return { ...prevValue, wrong: prevValue.wrong + 1 };
  });
}

export {
  geo,
  setGeo,
  features,
  setFeatures,
  current,
  setCurrent,
  guessed,
  setGuessed,
  wrong,
  setWrong,
  correct,
  setCorrect,
  status,
  setStatus,
  win,
  setWin,
  currText,
  setCurrText,
};
