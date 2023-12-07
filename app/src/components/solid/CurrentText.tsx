/** @jsxImportSource solid-js */
import { currText, current, win } from "@/store/map";
import {
  normalProperties,
  pienalueProperties,
  postinumeroalueProperties,
  vaalipiiriProperties,
} from "@/utils/types/geojson.types";

export default function CurrentText() {
  return (
    <div class="mb-2 text-3xl font-bold text-black">
      {() => {
        if (win()) {
          return <>Voitit pelin</>;
        }

        if (current()) {
          if (current()?.aluejako === "PIENALUE") {
            return (
              <>
                {pienalueProperties.parse(current()).osaalue_nimi_fi}{" "}
                {pienalueProperties.parse(current()).tunnus}
              </>
            );
          } else if (current()?.aluejako === "postinumeroalue") {
            return <>{postinumeroalueProperties.parse(current()).tunnus}</>;
          } else if (current()?.aluejako === "halke_aanestysalue") {
            const parsed = vaalipiiriProperties.parse(current());
            return (
              <>
                <div>{`${parsed.nimi_fi.substring(0, currText())}`}</div>
                <div>{`${parsed.topParty.party} ${parsed.topParty.count.toFixed(1)}%`}</div>
              </>
            );
          } else {
            return <>{normalProperties.parse(current()).nimi_fi}</>;
          }
        }
        return <></>;
      }}
    </div>
  );
}
