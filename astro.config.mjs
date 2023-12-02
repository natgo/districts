import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react({ include: ["**/react/*"] }),
    solidJs({ include: ["**/solid/*"] }),
  ],
});
