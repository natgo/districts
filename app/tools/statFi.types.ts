import { z } from "zod";

export const PxSchema = z.object({
  tableid: z.string(),
  decimals: z.number(),
});
export type Px = z.infer<typeof PxSchema>;

export const DatasetExtensionSchema = z.object({
  px: PxSchema,
});
export type DatasetExtension = z.infer<typeof DatasetExtensionSchema>;

export const StickyExtensionSchema = z.object({
  Vuosi: z.string(),
});
export type StickyExtension = z.infer<typeof StickyExtensionSchema>;

export const StickyDescribedbySchema = z.object({
  extension: StickyExtensionSchema,
});
export type StickyDescribedby = z.infer<typeof StickyDescribedbySchema>;

export const VuosiLinkSchema = z.object({
  describedby: z.array(StickyDescribedbySchema),
});
export type VuosiLink = z.infer<typeof VuosiLinkSchema>;

export const TentacledLabelSchema = z.object({
  "2023": z.string(),
});
export type TentacledLabel = z.infer<typeof TentacledLabelSchema>;

export const TentacledIndexSchema = z.object({
  "2023": z.number(),
});
export type TentacledIndex = z.infer<typeof TentacledIndexSchema>;

export const VuosiCategorySchema = z.object({
  index: TentacledIndexSchema,
  label: TentacledLabelSchema,
});
export type VuosiCategory = z.infer<typeof VuosiCategorySchema>;

export const AlueÄänestysalueExtensionSchema = z.object({
  show: z.string(),
});
export type AlueÄänestysalueExtension = z.infer<typeof AlueÄänestysalueExtensionSchema>;

export const VuosiSchema = z.object({
  label: z.string(),
  category: VuosiCategorySchema,
  link: VuosiLinkSchema,
  extension: AlueÄänestysalueExtensionSchema,
});
export type Vuosi = z.infer<typeof VuosiSchema>;

export const TentacledExtensionSchema = z.object({
  Valintatieto: z.string(),
});
export type TentacledExtension = z.infer<typeof TentacledExtensionSchema>;

export const TentacledDescribedbySchema = z.object({
  extension: TentacledExtensionSchema,
});
export type TentacledDescribedby = z.infer<typeof TentacledDescribedbySchema>;

export const ValintatietoLinkSchema = z.object({
  describedby: z.array(TentacledDescribedbySchema),
});
export type ValintatietoLink = z.infer<typeof ValintatietoLinkSchema>;

export const FluffyLabelSchema = z.object({
  SSS: z.string(),
});
export type FluffyLabel = z.infer<typeof FluffyLabelSchema>;

export const FluffyIndexSchema = z.object({
  SSS: z.number(),
});
export type FluffyIndex = z.infer<typeof FluffyIndexSchema>;

export const ValintatietoCategorySchema = z.object({
  index: FluffyIndexSchema,
  label: FluffyLabelSchema,
});
export type ValintatietoCategory = z.infer<typeof ValintatietoCategorySchema>;

export const ValintatietoSchema = z.object({
  label: z.string(),
  category: ValintatietoCategorySchema,
  link: ValintatietoLinkSchema,
  extension: AlueÄänestysalueExtensionSchema,
});
export type Valintatieto = z.infer<typeof ValintatietoSchema>;

export const EvaaOsuusAanistaSchema = z.object({
  base: z.string(),
  decimals: z.number(),
});
export type EvaaOsuusAanista = z.infer<typeof EvaaOsuusAanistaSchema>;

export const UnitSchema = z.object({
  evaa_osuus_aanista: EvaaOsuusAanistaSchema,
});
export type Unit = z.infer<typeof UnitSchema>;

export const PurpleLabelSchema = z.object({
  evaa_osuus_aanista: z.string(),
});
export type PurpleLabel = z.infer<typeof PurpleLabelSchema>;

export const PurpleIndexSchema = z.object({
  evaa_osuus_aanista: z.number(),
});
export type PurpleIndex = z.infer<typeof PurpleIndexSchema>;

export const TiedotCategorySchema = z.object({
  index: PurpleIndexSchema,
  label: PurpleLabelSchema,
  unit: UnitSchema,
});
export type TiedotCategory = z.infer<typeof TiedotCategorySchema>;

export const TiedotSchema = z.object({
  label: z.string(),
  category: TiedotCategorySchema,
  extension: AlueÄänestysalueExtensionSchema,
});
export type Tiedot = z.infer<typeof TiedotSchema>;

export const RoleSchema = z.object({
  time: z.array(z.string()),
  geo: z.array(z.string()),
  metric: z.array(z.string()),
});
export type Role = z.infer<typeof RoleSchema>;

export const FluffyExtensionSchema = z.object({
  Ehdokas: z.string(),
});
export type FluffyExtension = z.infer<typeof FluffyExtensionSchema>;

export const FluffyDescribedbySchema = z.object({
  extension: FluffyExtensionSchema,
});
export type FluffyDescribedby = z.infer<typeof FluffyDescribedbySchema>;

export const EhdokasLinkSchema = z.object({
  describedby: z.array(FluffyDescribedbySchema),
});
export type EhdokasLink = z.infer<typeof EhdokasLinkSchema>;

export const EhdokasCategorySchema = z.object({
  index: z.record(z.string(), z.number()),
  label: z.record(z.string(), z.string()),
});
export type EhdokasCategory = z.infer<typeof EhdokasCategorySchema>;

export const EhdokasSchema = z.object({
  label: z.string(),
  category: EhdokasCategorySchema,
  link: EhdokasLinkSchema,
  extension: AlueÄänestysalueExtensionSchema,
});
export type Ehdokas = z.infer<typeof EhdokasSchema>;

export const PurpleExtensionSchema = z.object({
  "Alue/Äänestysalue": z.string(),
});
export type PurpleExtension = z.infer<typeof PurpleExtensionSchema>;

export const PurpleDescribedbySchema = z.object({
  extension: PurpleExtensionSchema,
});
export type PurpleDescribedby = z.infer<typeof PurpleDescribedbySchema>;

export const AlueÄänestysalueLinkSchema = z.object({
  describedby: z.array(PurpleDescribedbySchema),
});
export type AlueÄänestysalueLink = z.infer<typeof AlueÄänestysalueLinkSchema>;

export const AlueÄänestysalueCategorySchema = z.object({
  index: z.record(z.string(), z.number()),
  label: z.record(z.string(), z.string()),
});
export type AlueÄänestysalueCategory = z.infer<typeof AlueÄänestysalueCategorySchema>;

export const AlueÄänestysalueSchema = z.object({
  label: z.string(),
  category: AlueÄänestysalueCategorySchema,
  link: AlueÄänestysalueLinkSchema,
  extension: AlueÄänestysalueExtensionSchema,
});
export type AlueÄänestysalue = z.infer<typeof AlueÄänestysalueSchema>;

export const DimensionSchema = z.object({
  Vuosi: VuosiSchema,
  "Alue/Äänestysalue": AlueÄänestysalueSchema,
  Ehdokas: EhdokasSchema,
  Valintatieto: ValintatietoSchema,
  Tiedot: TiedotSchema,
  id: z.array(z.string()),
  size: z.array(z.number()),
  role: RoleSchema,
});
export type Dimension = z.infer<typeof DimensionSchema>;

export const DatasetSchema = z.object({
  dimension: DimensionSchema,
  label: z.string(),
  source: z.string(),
  updated: z.coerce.date(),
  value: z.array(z.number()),
  extension: DatasetExtensionSchema,
});
export type Dataset = z.infer<typeof DatasetSchema>;

export const StatFiSchema = z.object({
  dataset: DatasetSchema,
});
export type StatFi = z.infer<typeof StatFiSchema>;
