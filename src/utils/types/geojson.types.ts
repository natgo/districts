import { z } from "zod";

export const baseProperties = z.object({
  id: z.number(),
  kunta: z.string(),
  tunnus: z.string(),
  yhtluontipvm: z.union([z.string(), z.null()]),
  yhtmuokkauspvm: z.union([z.string(), z.null()]).optional(),
  yhtdatanomistaja: z.union([z.string(), z.null()]),
  paivitetty_tietopalveluun: z.string(),
});

export const pienalueProperties = baseProperties.extend({
  aluejako: z.literal("PIENALUE"),
  osaalue_tunnus: z.string(),
  osaalue_nimi_fi: z.string(),
  osaalue_nimi_se: z.string(),
  peruspiiri_tunnus: z.string(),
  peruspiiri_nimi_fi: z.string(),
  peruspiiri_nimi_se: z.string(),
  suurpiiri_tunnus: z.string(),
  suurpiiri_nimi_fi: z.string(),
  suurpiiri_nimi_se: z.string(),
});

export const postinumeroalueProperties = baseProperties.extend({
  aluejako: z.literal("postinumeroalue"),
  nimi_fi: z.string(),
  nimi_se: z.string(),
});

export const normalProperties = baseProperties.extend({
  aluejako: z.enum(["KAUPUNGINOSA", "OSA-ALUE", "SUURPIIRI", "PERUSPIIRI"]),
  nimi_fi: z.string(),
  nimi_se: z.string(),
});

export const vaalipiiriProperties = baseProperties.extend({
  aluejako: z.literal("halke_aanestysalue"),
  nimi_fi: z.string(),
  nimi_se: z.string().nullable(),
  toimipiste_id: z.number().nullable(),
  topParty: z.object({ party: z.string(), count: z.number() }),
});

export const properties = z.union([
  normalProperties,
  pienalueProperties,
  postinumeroalueProperties,
  vaalipiiriProperties,
]);
export type Properties = z.infer<typeof properties>;

export const signleFeature = z.object({
  type: z.string(),
  id: z.string(),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.array(z.array(z.number()))),
  }),
  geometry_name: z.string(),
  properties: properties,
});
export type SignleFeature = z.infer<typeof signleFeature>;

export const geoSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(signleFeature),
  totalFeatures: z.number(),
  numberMatched: z.number(),
  numberReturned: z.number(),
  timeStamp: z.string(),
  crs: z.object({
    type: z.literal("name"),
    properties: z.object({ name: z.string() }),
  }),
});
export type GeoSchema = z.infer<typeof geoSchema>;
