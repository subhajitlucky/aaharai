import { z } from "zod";
import { sourceIdSchema } from "@/lib/domain/source";
import { recipeIdSchema, reviewEvidenceIdSchema } from "@/lib/content/schema";

const reviewTextSchema = z.string().trim().min(1);

export const reviewSourceCheckSchema = z
  .object({
    sourceId: sourceIdSchema,
    check: reviewTextSchema,
  })
  .strict();

export const reviewNutritionCheckSchema = z
  .object({
    manifestVersion: z.literal(1),
    status: z.literal("recomputed"),
    checkedAt: z.literal("2026-09-25"),
  })
  .strict();

export const reviewEvidenceEntrySchema = z
  .object({
    recipeId: recipeIdSchema,
    evidenceId: reviewEvidenceIdSchema,
    role: z.literal("Aaharai AI-assisted source audit"),
    reviewedAt: z.literal("2026-09-25"),
    sourceChecks: z.array(reviewSourceCheckSchema).min(1),
    adaptations: z.array(reviewTextSchema).min(1),
    nutritionCalculationCheck: reviewNutritionCheckSchema,
    limitations: z.array(reviewTextSchema).min(1),
  })
  .strict();

export const reviewEvidenceManifestSchema = z
  .object({
    version: z.literal(1),
    entries: z.array(reviewEvidenceEntrySchema).min(1),
  })
  .strict();

export type ReviewEvidenceEntry = z.infer<typeof reviewEvidenceEntrySchema>;
export type ReviewEvidenceManifest = z.infer<typeof reviewEvidenceManifestSchema>;
