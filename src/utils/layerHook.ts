import {
  current,
  features,
  guessed,
  incrementCorrect,
  incrementWrong,
  setCurrText,
  setCurrent,
  setFeatures,
  setGuessed,
  setWin,
  setWrong,
  wrong,
} from "@/store/map";

import { signleFeature } from "./types/geojson.types";

export function layerHook(geoLayer: L.GeoJSON<any, GeoJSON.GeometryObject>) {
  geoLayer.eachLayer((layer) => {
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
          incrementCorrect();
          setWin(true);
          return;
        }

        geoLayer.eachLayer((element) => {
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
        setCurrent(() => features()[0]?.properties);
        setGuessed((prevGuessed) => [...prevGuessed, feature.properties]);
        incrementCorrect();
        setCurrText(1);
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
          setCurrText((prevCount) => prevCount + 1);
        }

        setWrong((prevWrong) => [...prevWrong, feature.properties]);
      }
    });
  });
}
