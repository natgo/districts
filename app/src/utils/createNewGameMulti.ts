import topParties from "@/assets/topParties.json";
import { geo, setCurrent, setFeatures, setGeo, setGuessed, setStatus, setWrong } from "@/store/map";

import shuffle from "./shuffle";
import { geoSchema } from "./types/geojson.types";
import type { Types } from "./types/map.types";

const vaalipiirit = await import("@/assets/vaalialueet.json");

export async function createNewGameMulti(type: Types) {
  setStatus(true);

  // Loading state
  setCurrent({
    id: 0,
    kunta: "",
    tunnus: "",
    yhtluontipvm: "",
    yhtdatanomistaja: "",
    paivitetty_tietopalveluun: "",
    aluejako: "KAUPUNGINOSA",
    nimi_fi: "Loading...",
    nimi_se: "",
  });

  switch (type) {
    case "kaupunginosat":
      setGeo(geoSchema.parse(await import("@/assets/kaupunginosat.json")));
      break;
    case "osaalueet":
      setGeo(geoSchema.parse(await import("@/assets/osaalueet.json")));
      break;
    case "peruspiirit":
      setGeo(geoSchema.parse(await import("@/assets/peruspiirit.json")));
      break;
    case "pienalueet":
      setGeo(geoSchema.parse(await import("@/assets/pienalueet.json")));
      break;
    case "postinumerot":
      setGeo(geoSchema.parse(await import("@/assets/postinumerot.json")));
      break;
    case "suurpiirit":
      setGeo(geoSchema.parse(await import("@/assets/suurpiirit.json")));
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

  setFeatures(geo().features);
}
