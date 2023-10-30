import { createEffect, createSignal } from "solid-js";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import CurrentText from "~/components/CurrentText";
import {
  correct,
  current,
  features,
  geo,
  guessed,
  incrementCorrect,
  incrementWrong,
  setCurrent,
  setFeatures,
  setGuessed,
  setWin,
  setWrong,
  status,
  wrong,
} from "~/store/map";
import { cleanGame } from "~/utils/cleanGame";
import { createNewGame } from "~/utils/createNewGame";
import { signleFeature } from "~/utils/geojson.types";
import { Types, types } from "~/utils/map.types";

export default function MapPage() {
  const [map, setMap] = createSignal<L.Map>();
  const [type, setType] = createSignal<Types>("kaupunginosat");

  const layerGroup = new L.LayerGroup();
  let geolayer: L.GeoJSON<any, GeoJSON.GeometryObject>;

  createEffect(() => {
    const mapDiv = document.getElementById("main-map") as HTMLDivElement;
    const newMap = L.map(mapDiv).setView([60.1667, 25], 11);

    L.tileLayer("https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png", {
      maxZoom: 19,
      minZoom: 10,
      attribution:
        // eslint-disable-next-line quotes
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a><br/>Data <a href="https://creativecommons.org/licenses/by/4.0/">CC-by</a> Helsingin kaupunki, kaupunkimittauspalvelut.',
    }).addTo(newMap);

    setMap(newMap);
  });

  return (
    <main class="mx-auto flex h-full w-full p-4 text-center text-gray-700">
      <div class=" h-full w-full">
        <div id="main-map" class="h-full" />
      </div>

      <div class="mx-5 my-3 w-1/6">
        <label
          for="type"
          class={status() ? "hidden" : "mb-2 block text-sm font-medium text-gray-900"}
        >
          Select gamemode
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
              : "mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          }
        >
          <option value="kaupunginosat">Kaupunginosat</option>
          <option value="osaalueet">Osa-alueet</option>
          <option value="pienalueet">Pienalueet</option>
          <option value="peruspiirit">Peruspiirit</option>
          <option value="suurpiirit">Suurpiirit</option>
          <option value="postinumerot">Postinumeroalueet</option>
        </select>
        <CurrentText />
        <button
          onClick={() => {
            if (status()) {
              cleanGame();
              layerGroup.removeLayer(geolayer);
            } else {
              createNewGame(type());
              geolayer = L.geoJSON(geo(), {
                style: {
                  color: "#0000ff",
                  fillOpacity: 0,
                  opacity: 0.7,
                },
              });
              layerGroup.addLayer(geolayer);
              layerGroup.addTo(map());

              geolayer.eachLayer((layer) => {
                layer.on("click", (event) => {
                  const feature = signleFeature.parse(event.target.feature);

                  if (guessed().find((element) => element.id === feature.properties.id)) {
                    console.log("already correct");
                  } else if (feature.properties.id === current()?.id) {
                    layer.setStyle({
                      color: "#00ff00",
                      fillOpacity: 0.4,
                      opacity: 0.5,
                    });
                    if (features().length === 1) {
                      setFeatures((prevFeatures) => prevFeatures.slice(1));
                      setWin(true);
                      return;
                    }

                    geolayer.eachLayer((element) => {
                      const feature = signleFeature.parse(element.feature);

                      wrong().forEach((wrongElement) => {
                        if (feature.properties.id === wrongElement.id) {
                          element.setStyle({
                            color: "#0000ff",
                            fillOpacity: 0,
                            opacity: 0.7,
                          });
                        }
                      });
                    });

                    setFeatures((prevFeatures) => prevFeatures.slice(1));
                    setCurrent(() => features()[0].properties);
                    setGuessed((prevGuessed) => [...prevGuessed, feature.properties]);
                    incrementCorrect();
                    setWrong(() => []);
                  } else {
                    layer.setStyle({
                      color: "#ff0000",
                      fillOpacity: 0.4,
                      opacity: 0.5,
                    });

                    if (
                      !wrong().find((element) => {
                        return element.id === feature.properties.id;
                      })
                    ) {
                      incrementWrong();
                    }

                    setWrong((prevWrong) => [...prevWrong, feature.properties]);
                  }
                });
              });
            }
          }}
          class="rounded bg-sky-500 px-2 py-1 font-bold text-white hover:bg-sky-700"
        >
          {status() ? "End game" : "Start game"}
        </button>
        <div class={status() ? "" : "hidden"}>
          <span>Correct: {correct().correct}</span> <span>Wrong: {correct().wrong}</span>
        </div>
      </div>
    </main>
  );
}
