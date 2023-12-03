import { type Properties, geoSchema } from "@/utils/types/geojson.types";
import fs from "fs";

import halke from "./stat.fi.halke.json";
import { StatFiSchema } from "./statFi.types";
import vaalialueet from "./vaalialueet.json";

const parsedStat = StatFiSchema.parse(halke).dataset;
const parsedVaalialueet = geoSchema.parse(vaalialueet);

const districts: Properties[] = [];

function statFiToHelTunnus(label: string) {
  const match = parsedVaalialueet.features.find((value) => {
    const tunnus = value.properties.tunnus;
    return label.match(tunnus);
  });
  return match?.properties;
}

Object.entries(parsedStat.dimension["Alue/Äänestysalue"].category.label).forEach(([key, value]) => {
  const match = statFiToHelTunnus(value);
  if (!match) {
    throw new Error("Not found");
  }
  districts.push(match);
});
console.log(districts);

const candidates: string[] = [];

const partyRegex = new RegExp(/\/\s(.*)\s\//);
function getParty(candidate: string) {
  const match = candidate.match(partyRegex);
  if (!match) {
    throw new Error("Party not found");
  }
  candidates.push(match[1]);
}

Object.entries(parsedStat.dimension.Ehdokas.category.label).forEach(([key, value]) => {
  getParty(value);
});
console.log(candidates);

const tempArray: { district: string; party: string; count: number }[] = [];

let districtNumber = 0;
parsedStat.value.forEach((element, index) => {
  const i = index % candidates.length;
  if (i === 0) {
    districtNumber++;
  }
  tempArray.push({
    district: districts[districtNumber - 1].tunnus,
    party: candidates[i],
    count: element,
  });
});

const parties = [
  "SDP",
  "PS",
  "KOK",
  "KESK",
  "VIHR",
  "VAS",
  "RKP",
  "KD",
  "LIIKE",
  "LIBE",
  "Piraattip.",
  "EOP",
  "FP",
  "KL",
  "SKE",
  "AP",
  "SKP",
  "KRIP",
  "VKK",
  "VL",
  "Muut",
];
const districtsCounts: { district: string; parties: { party: string; count: number }[] }[] = [];
districts.forEach((districtElement) => {
  const districtCount: { party: string; count: number }[] = [];
  parties.forEach((partyElement) => {
    let partyCount = 0;
    tempArray.forEach((element) => {
      if (element.party === partyElement && element.district === districtElement.tunnus) {
        partyCount += element.count;
      }
    });
    districtCount.push({ party: partyElement, count: partyCount });
  });
  districtsCounts.push({ district: districtElement.tunnus, parties: districtCount });
});

const topParties: { district: string; top: { party: string; count: number } }[] = [];
districtsCounts.forEach((element) => {
  const sorted = element.parties.toSorted((a, b) => {
    return b.count - a.count;
  });
  topParties.push({ district: element.district, top: sorted[0] });
});

console.log(topParties);
fs.writeFileSync("./topParties.json", JSON.stringify(topParties));
