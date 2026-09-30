import { z } from "zod";

export const sourceIdSchema = z
  .string()
  .regex(/^src-[a-z0-9-]+$/, "source id: use src- followed by lowercase kebab-case");

export const sourceTypeSchema = z.enum([
  "published-cookbook",
  "community-cookbook",
  "oral-history",
  "classical-text",
  "government-food-nutrition-table",
  "research-paper",
  "open-dataset",
]);

export const sourceRightsSchema = z.enum([
  "cited",
  "licensed",
  "public-domain",
  "permission-obtained",
]);

const sourceTextSchema = z.string().trim().min(1);

export const sourceUrlSchema = z.string().url().refine(
  (value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  },
  "source url: use an HTTP or HTTPS URL",
);

export const sourceSchema = z.object({
  id: sourceIdSchema,
  title: sourceTextSchema,
  sourceType: sourceTypeSchema,
  citation: sourceTextSchema,
  url: sourceUrlSchema.optional(),
  accessedAt: z.string().date().optional(),
  rights: sourceRightsSchema,
  rightsEvidence: sourceTextSchema,
  usageBoundary: sourceTextSchema,
  licenseUrl: sourceUrlSchema.optional(),
  reviewedBy: z.literal("Aaharai AI-assisted source audit"),
  reviewedAt: z.literal("2026-09-25"),
});

export const sourceCatalogSchema = z.object({
  version: z.literal(1),
  sources: z.array(sourceSchema),
}).strict();

export type SourceId = z.infer<typeof sourceIdSchema>;
export type SourceType = z.infer<typeof sourceTypeSchema>;
export type SourceRights = z.infer<typeof sourceRightsSchema>;
export type FoodSource = z.infer<typeof sourceSchema>;
export type SourceCatalog = z.infer<typeof sourceCatalogSchema>;
