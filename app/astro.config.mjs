import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { visualizer } from "rollup-plugin-visualizer";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react({
      include: ["**/react/*"],
    }),
    solidJs({
      include: ["**/solid/*"],
    }),
  ],
  vite: { plugins: [visualizer({ gzipSize: true, brotliSize: true })] },
});
