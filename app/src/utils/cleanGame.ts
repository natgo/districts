import {
  setCorrect,
  setCurrent,
  setFeatures,
  setGuessed,
  setStatus,
  setWin,
  setWrong,
} from "@/store/map";

export function cleanGame() {
  setFeatures([]);
  setCurrent();
  setGuessed([]);
  setWrong([]);
  setCorrect({ correct: 0, wrong: 0 });
  setWin(false);
  setStatus(false);
}
