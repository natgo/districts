import kaupunginosat from "~/assets/kaupunginosat.json";
import osaalueet from "~/assets/osaalueet.json";
import peruspiirit from "~/assets/peruspiirit.json";
import pienalueet from "~/assets/pienalueet.json";
import postinumerot from "~/assets/postinumerot.json";
import suurpiirit from "~/assets/suurpiirit.json";
import vaalipiirit from "~/assets/vaalialueet.json";
import { geo, setCurrent, setFeatures, setGeo, setGuessed, setStatus, setWrong } from "~/store/map";

import { geoSchema } from "./geojson.types";
import { Types } from "./map.types";
import shuffle from "./shuffle";

export function createNewGame(type: Types) {
  setStatus(true);
  switch (type) {
    case "kaupunginosat":
      setGeo(geoSchema.parse(kaupunginosat));
      break;
    case "osaalueet":
      setGeo(geoSchema.parse(osaalueet));
      break;
    case "peruspiirit":
      setGeo(geoSchema.parse(peruspiirit));
      break;
    case "pienalueet":
      setGeo(geoSchema.parse(pienalueet));
      break;
    case "postinumerot":
      setGeo(geoSchema.parse(postinumerot));
      break;
    case "suurpiirit":
      setGeo(geoSchema.parse(suurpiirit));
      break;
    case "vaalipiirit":
      setGeo(geoSchema.parse(vaalipiirit));
      break;
  }

  const shuffled = shuffle(geo().features);
  setFeatures(shuffled);

  setCurrent(shuffled[0].properties);
  setGuessed([]);
  setWrong([]);
}
