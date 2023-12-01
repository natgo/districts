import { current, win } from "~/store/map";
import {
  normalProperties,
  pienalueProperties,
  postinumeroalueProperties,
  vaalipiiriProperties,
} from "~/utils/geojson.types";

export default function CurrentText() {
  return (
    <div class="mb-2 text-3xl font-bold">
      {() => {
        if (win()) {
          return "Voitit pelin";
        }

        if (current()) {
          if (current()?.aluejako === "PIENALUE") {
            return `${pienalueProperties.parse(current()).osaalue_nimi_fi} ${
              pienalueProperties.parse(current()).tunnus
            }`;
          } else if (current()?.aluejako === "postinumeroalue") {
            return postinumeroalueProperties.parse(current()).tunnus;
          } else if (current()?.aluejako === "halke_aanestysalue") {
            return vaalipiiriProperties.parse(current()).nimi_fi;
          } else {
            return normalProperties.parse(current()).nimi_fi;
          }
        }
        return "";
      }}
    </div>
  );
}
