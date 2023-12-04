/** @jsxImportSource solid-js */
import { type Accessor, createSignal } from "solid-js";

import CurrentText from "@/components/solid/CurrentText";
import { correct, geo, status } from "@/store/map";
import { cleanGame } from "@/utils/cleanGame";
import { createNewGame } from "@/utils/createNewGame";
import { layerHook } from "@/utils/layerHook";
import { type Types, types } from "@/utils/types/map.types";
import L from "leaflet";

export function FloatingBox(props: { map: Accessor<L.Map | undefined> }) {
  const [type, setType] = createSignal<Types>("kaupunginosat");
  let geoLayer: L.GeoJSON<any, GeoJSON.GeometryObject>;
  const layerGroup = new L.LayerGroup();

  return (
    <div class="fixed bottom-28 right-0 top-28 z-[1000] m-5 flex w-1/6 flex-col gap-4 rounded-3xl bg-white p-5">
      <div class={"flex flex-col items-center gap-2"}>
        <h1 class="mb-4 text-2xl font-bold">Single-player</h1>
        <label
          for="type"
          class={status() ? "hidden" : "mb-2 block text-sm font-medium text-gray-900"}
        >
          Select game mode
        </label>
        <select
          id="type"
          onChange={(event) => {
            setType(types.parse(event.target.value));
          }}
          value={type()}
          class={
            status()
              ? "hidden"
              : "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          }
        >
          <option value="kaupunginosat">Kaupunginosat</option>
          <option value="osaalueet">Osa-alueet</option>
          <option value="pienalueet">Pienalueet</option>
          <option value="peruspiirit">Peruspiirit</option>
          <option value="suurpiirit">Suurpiirit</option>
          <option value="postinumerot">Postinumeroalueet</option>
          <option value="vaalipiirit">Vaalipiirit</option>
        </select>
        <CurrentText />
        <button
          onClick={async () => {
            if (status()) {
              cleanGame();
              layerGroup.removeLayer(geoLayer);
            } else {
              await createNewGame(type());
              geoLayer = L.geoJSON(geo(), {
                style: {
                  color: "#0000ff",
                  fillOpacity: 0,
                  opacity: 0.7,
                },
              });

              layerGroup.addLayer(geoLayer);
              layerGroup.addTo(props.map());

              layerHook(geoLayer);
            }
          }}
          class="w-fit rounded bg-sky-500 px-2 py-1 font-bold text-white hover:bg-sky-700"
        >
          {status() ? "End game" : "Start game"}
        </button>
        <div class={status() ? "" : "hidden"}>
          <span>Correct: {correct().correct}</span> <span>Wrong: {correct().wrong}</span>
        </div>
      </div>
    </div>
  );
}
