/** @jsxImportSource solid-js */
import { createEffect, createSignal } from "solid-js";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FloatingBoxMulti } from "./FloatingBoxMulti";

export default function MultiMapPage() {
  const [map, setMap] = createSignal<L.Map>();

  createEffect(() => {
    const mapDiv = document.getElementById("main-map") as HTMLDivElement;
    const newMap = L.map(mapDiv, { zoomControl: false }).setView([60.1667, 25], 11);

    L.tileLayer("https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png", {
      maxZoom: 19,
      minZoom: 10,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a><br/>Data <a href="https://creativecommons.org/licenses/by/4.0/">CC-by</a> City of Helsinki, City Survey Services.',
    }).addTo(newMap);

    setMap(newMap);
  });

  return (
    <main class="mx-auto flex h-full w-full text-center text-gray-700">
      <div class="h-full w-full">
        <div id="main-map" class="h-full" />
      </div>

      <FloatingBoxMulti map={map} />
    </main>
  );
}
