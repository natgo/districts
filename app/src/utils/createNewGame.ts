import kaupunginosat from "@/assets/kaupunginosat.json";
import osaalueet from "@/assets/osaalueet.json";
import peruspiirit from "@/assets/peruspiirit.json";
import pienalueet from "@/assets/pienalueet.json";
import postinumerot from "@/assets/postinumerot.json";
import suurpiirit from "@/assets/suurpiirit.json";
import topParties from "@/assets/topParties.json";
import vaalipiirit from "@/assets/vaalialueet.json";
import { geo, setCurrent, setFeatures, setGeo, setGuessed, setStatus, setWrong } from "@/store/map";

import shuffle from "./shuffle";
import { geoSchema } from "./types/geojson.types";
import type { Types } from "./types/map.types";

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
      vaalipiirit.features.forEach((element) => {
        element.properties.topParty = topParties.find((value) => {
          return element.properties.tunnus === value.district;
        })?.top;
      });
      setGeo(geoSchema.parse(vaalipiirit));
      break;
  }

  const shuffled = shuffle(geo().features);
  setFeatures(shuffled);

  setCurrent(shuffled[0]?.properties);
  setGuessed([]);
  setWrong([]);
}