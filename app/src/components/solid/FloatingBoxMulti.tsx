/** @jsxImportSource solid-js */
import { type Accessor, For, createSignal } from "solid-js";

import CurrentText from "@/components/solid/CurrentText";
import { current, geo, setCurrent, status } from "@/store/map";
import {
  corrects,
  host,
  members,
  score,
  selected,
  setCorrects,
  setHost,
  setMembers,
  setSelected,
} from "@/store/multiPlayer";
import { cleanGame } from "@/utils/cleanGame";
import { createNewGame } from "@/utils/createNewGame";
import { singleFeature } from "@/utils/types/geojson.types";
import { type Types, types } from "@/utils/types/map.types";
import { WSReturnType } from "@/utils/types/returnType";
import { createWS } from "@solid-primitives/websocket";
import L from "leaflet";

export function FloatingBoxMulti(props: { map: Accessor<L.Map | undefined> }) {
  const [type, setType] = createSignal<Types>("kaupunginosat");
  let geoLayer: L.GeoJSON<any, GeoJSON.GeometryObject>;
  const layerGroup = new L.LayerGroup();

  const url = new URL(location.href);
  const ws = createWS("ws://localhost:3000/api/ws" + url.search);
  ws.addEventListener("message", (event) => parseWSEvent(event.data));

  const parseWSEvent = (event: string) => {
    const data = WSReturnType.parse(JSON.parse(event));

    if ("members" in data) {
      setMembers(data.members);
    }

    if ("join" in data) {
      setMembers((prev) => [...prev, data.join]);
    }

    if ("creator" in data) {
      setHost(true);
    }

    if ("start" in data) {
      startGame();
    }

    if ("next" in data) {
      geoLayer.eachLayer((layer) => {
        const layerFeature = singleFeature.parse(layer.feature);
        if (layerFeature.properties.id === data.next) {
          setCurrent(layerFeature.properties);
        }
      });
    }

    if ("correct" in data) {
      if (data.correct === true) {
        selected()?.setStyle({
          color: "#00ff00",
          fillOpacity: 0.4,
          opacity: 0.5,
        });
        setCorrects((prevGuessed) => [...prevGuessed, current()!]);
        setSelected();
      } else {
        selected()?.setStyle({
          color: "#000000",
          fillOpacity: 0.4,
          opacity: 0.5,
        });

        setCorrects((prevGuessed) => [...prevGuessed, current()!]);
        setSelected();
      }
      geoLayer.eachLayer((layer) => {
        const layerFeature = singleFeature.parse(layer.feature);
        if (layerFeature.properties.id === current()?.id) {
          layer.setStyle({
            color: "#00ff00",
            fillOpacity: 0.4,
            opacity: 0.5,
          });
        }
      });
    }

    return data;
  };

  const createGame = () => {
    ws.send(JSON.stringify({ start: true }));
    startGame();
  };

  const startGame = async () => {
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

    geoLayer.eachLayer((layer) => {
      layer.on("click", (event) => {
        const clickedLayerFeature = singleFeature.parse(event.target.feature);

        if (corrects().find((element) => element.id === clickedLayerFeature.properties.id)) {
          console.log("already correct");
        } else {
          // Set selected color
          layer.setStyle({
            color: "#ffff00",
            fillOpacity: 0.4,
            opacity: 0.5,
          });
          setSelected(layer);
          ws.send(
            JSON.stringify({
              guess:
                "nimi_fi" in clickedLayerFeature.properties
                  ? clickedLayerFeature.properties.nimi_fi
                  : undefined,
            }),
          );
        }
      });
    });
  };

  return (
    <div class="fixed right-0 top-28 z-[1000] m-5 flex w-1/6 flex-col gap-4 rounded-3xl bg-white p-5">
      <div class={"flex flex-col items-center gap-2 font-outfit"}>
        <h1 class="mb-4 text-2xl font-bold text-black">Multi-player</h1>
        <div class={status() ? "hidden" : "mb-2 block text-sm font-medium text-black"}>
          {host() ? "Select game mode" : "Waiting host to start"}
        </div>
        <div class={host() ? undefined : "hidden"}>
          <select
            id="type"
            onChange={(event) => {
              setType(types.parse(event.target.value));
            }}
            value={type()}
            class={
              status()
                ? "hidden"
                : "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-black focus:border-black focus:ring-black"
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
        </div>
        <CurrentText />
        <button
          onClick={() => createGame()}
          class={`h-10 w-fit rounded-full bg-black px-4 py-2 text-center font-bold text-white hover:bg-gray-800 ${
            host() ? undefined : "hidden"
          } ${status() ? "hidden" : undefined}`}
        >
          Start game
        </button>
        <div class={status() ? undefined : "hidden"}>
          <span>Score: {score()}</span>
        </div>
      <div>
        Players:
        <div class="flex w-64 flex-col items-center font-mono">
          <div class="mt-10 flex flex-wrap justify-center items-center gap-2 text-2xl">
            <For
              each={members()}
              fallback={<div>Waiting...</div>}
            >
              {(item) => <div class=" px-2 pb-0.5 rounded-xl bg-black text-sm text-white">{item}</div>}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
