import { z } from "zod";
import { sourceIdSchema } from "@/lib/domain/source";
import { recipeIdSchema, sourceFidelityIdSchema } from "@/lib/content/schema";

const fidelityTextSchema = z.string().trim().min(1);

export const sourceFidelityRecordSchema = z
  .object({
    recipeId: recipeIdSchema,
    fidelityId: sourceFidelityIdSchema,
    sourceIds: z.array(sourceIdSchema).min(1),
    sourceTerms: z.array(fidelityTextSchema).min(1),
    adaptations: z.array(fidelityTextSchema).min(1),
    boundary: fidelityTextSchema,
  })
  .strict();

export const sourceFidelityManifestSchema = z
  .object({
    version: z.literal(1),
    records: z.array(sourceFidelityRecordSchema).min(1),
  })
  .strict();

export type SourceFidelityRecord = z.infer<typeof sourceFidelityRecordSchema>;
export type SourceFidelityManifest = z.infer<typeof sourceFidelityManifestSchema>;
