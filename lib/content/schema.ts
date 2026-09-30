import { z } from "zod";
import { allergenIdsSchema } from "@/lib/domain/allergen";
import { nutritionPanelSchema } from "@/lib/domain/nutrition";
import { sourceIdSchema } from "@/lib/domain/source";

const lineageEntrySchema = z.object({
  name: z.string().min(1),
  relation: z.string().optional(),
  place: z.string().optional(),
  era: z.string().optional(),
});

export const recipeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug: lowercase kebab-case only"),
  title: z.string().min(1),
  nativeName: z.object({
    text: z.string().min(1),
    script: z.string().min(1),
  }),
  transliteration: z.string().optional(),
  dialectVariant: z.string().optional(),
  region: z.object({
    state: z.string().min(1),
    subRegion: z.string().optional(),
    community: z.string().optional(),
  }),
  languageNote: z.string().optional(),
  lineage: z.object({
    sourceType: z.enum(["oral", "family-manuscript", "community-cookbook"]),
    entries: z.array(lineageEntrySchema).min(1),
    publishedRef: z.string().optional(),
  }),
  verification: z.object({
    tier: z.enum(["family-archive", "community-verified"]),
    verifierName: z.string().min(1),
    verifiedAt: z.string(),
  }),
  occasions: z.array(z.string()).min(1),
  seasonalWindow: z.string().optional(),
  dietaryFrame: z.enum(["satvik", "jain", "no-onion-garlic", "non-veg", "vegan", "vegetarian"]),
  ingredients: z.array(
    z.object({
      item: z.string().min(1),
      qty: z.string().min(1),
      note: z.string().optional(),
      nativeTerm: z.string().optional(),
    })
  ).min(1),
  steps: z.array(
    z.object({
      text: z.string().min(1),
      tip: z.string().optional(),
      technique: z.string().optional(),
    })
  ).min(1),
  time: z.object({
    prepMinutes: z.number().int().positive(),
    cookMinutes: z.number().int().positive(),
  }),
  servings: z.number().int().positive(),
  variations: z.array(
    z.object({
      label: z.string().min(1),
      note: z.string(),
    })
  ),
  authenticityNotes: z.string().optional(),
  heroImage: z.string().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

export const recipeIdSchema = z
  .string()
  .regex(/^recipe-[a-z0-9-]+$/, "recipe id: use recipe- followed by lowercase kebab-case");

export const ingredientIdSchema = z
  .string()
  .regex(
    /^ingredient-[a-z0-9-]+$/,
    "ingredient id: use ingredient- followed by lowercase kebab-case"
  );

export const substitutionIdSchema = z
  .string()
  .regex(
    /^sub-[a-z0-9-]+$/,
    "substitution id: use sub- followed by lowercase kebab-case"
  );

export const ingredientUnitSchema = z.enum([
  "g",
  "kg",
  "mg",
  "ml",
  "l",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "pieces",
  "clove",
  "slice",
  "bunch",
  "handful",
  "pinch",
  "sprig",
  "leaf",
  "can",
  "packet",
  "quart",
  "pint",
]);

export const ingredientQuantitySchema = z.object({
  ingredientId: ingredientIdSchema,
  quantity: z.number().finite().positive(),
  unit: ingredientUnitSchema,
  note: z.string().trim().min(1).optional(),
});

export const monthSchema = z.number().int().min(1).max(12);

const sameYearSeasonWindowSchema = z
  .object({
    calendar: z.literal("same-year"),
    startMonth: monthSchema,
    endMonth: monthSchema,
  })
  .superRefine((window, context) => {
    if (window.startMonth > window.endMonth) {
      context.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "same-year season windows must not wrap across years",
      });
    }
  });

const crossYearSeasonWindowSchema = z
  .object({
    calendar: z.literal("cross-year"),
    startMonth: monthSchema,
    endMonth: monthSchema,
  })
  .superRefine((window, context) => {
    if (window.startMonth <= window.endMonth) {
      context.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "cross-year season windows must end before they start",
      });
    }
  });

export const seasonWindowSchema = z.discriminatedUnion("calendar", [
  sameYearSeasonWindowSchema,
  crossYearSeasonWindowSchema,
]);

export const trustLabelSchema = z.enum([
  "source-cited",
  "regional-heritage",
  "community-tested",
  "ai-created",
]);

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const costTierSchema = z.enum(["low", "medium", "high"]);

export const dietaryTagSchema = z.enum([
  "satvik",
  "jain",
  "no-onion-garlic",
  "non-veg",
  "vegan",
  "vegetarian",
  "dairy-free",
  "gluten-free",
  "nut-free",
]);

export const seasonTagSchema = z.enum([
  "spring",
  "summer",
  "monsoon",
  "autumn",
  "fall",
  "winter",
  "year-round",
  "all-season",
  "pre-monsoon",
  "post-monsoon",
]);

export const mealCategorySchema = z.enum([
  "breakfast",
  "main-course",
  "side-dish",
  "snack",
  "dessert",
]);

export const reviewEvidenceIdSchema = z
  .string()
  .regex(/^review-[a-z0-9-]+$/, "review evidence id: use review- followed by lowercase kebab-case");

export const sourceFidelityIdSchema = z
  .string()
  .regex(/^fidelity-[a-z0-9-]+$/, "source fidelity id: use fidelity- followed by lowercase kebab-case");

const communityTestingEvidenceSchema = z
  .object({
    method: z.string().trim().min(1),
    participants: z.string().trim().min(1),
    recordedAt: z.string().date(),
    record: z.string().trim().min(1),
  })
  .strict();

const aiProvenanceSchema = z
  .object({
    claim: z.literal("ai-created"),
  })
  .strict();

const sourceCitedProvenanceSchema = z
  .object({
    claim: z.literal("source-cited"),
  })
  .strict();

const regionalHeritageProvenanceSchema = z
  .object({
    claim: z.literal("regional-heritage"),
  })
  .strict();

const communityTestedProvenanceSchema = z
  .object({
    claim: z.literal("community-tested"),
  })
  .strict();

export const provenanceSchema = z.discriminatedUnion("claim", [
  aiProvenanceSchema,
  sourceCitedProvenanceSchema,
  regionalHeritageProvenanceSchema,
  communityTestedProvenanceSchema,
]);

const sourcedRecipeBaseSchema = recipeSchema.omit({
  lineage: true,
  verification: true,
  time: true,
  dietaryFrame: true,
  seasonalWindow: true,
});

const sourcedRegionSchema = recipeSchema.shape.region.extend({
  district: z.string().trim().min(1).optional(),
});

const sourcedLineageSchema = recipeSchema.shape.lineage.extend({
  publishedRef: z.string().trim().min(1).optional(),
});

const sourcedVerificationSchema = recipeSchema.shape.verification.extend({
  verifierName: z.string().trim().min(1),
  verifiedAt: z.string().date(),
});

const sourcedSourceCitedVerificationSchema = sourcedVerificationSchema.extend({
  tier: z.literal("source-cited"),
});

const sourcedCommunityVerificationSchema = sourcedVerificationSchema.extend({
  tier: z.literal("community-verified"),
});

const sourcedRecipeCommonShape = {
  id: recipeIdSchema,
  region: sourcedRegionSchema,
  seasonWindow: seasonWindowSchema,
  ingredients: z.array(ingredientQuantitySchema).min(1),
  allergenIds: allergenIdsSchema,
  nutrition: nutritionPanelSchema,
  totalTimeMinutes: z.number().int().positive(),
  difficulty: difficultySchema,
  substitutionIds: z.array(substitutionIdSchema),
  costTier: costTierSchema,
  dietaryTags: z.array(dietaryTagSchema).min(1),
  seasonTags: z.array(seasonTagSchema).min(1),
  mealCategory: mealCategorySchema,
  nutritionManifestVersion: z.literal(1),
};

const sourcedRecipeCommonSchema = sourcedRecipeBaseSchema
  .extend(sourcedRecipeCommonShape)
  .strict();

const aiSourcedRecipeSchema = sourcedRecipeCommonSchema
  .extend({
    trustLabel: z.literal("ai-created"),
    sourceIds: z.array(sourceIdSchema).max(0),
    provenance: aiProvenanceSchema,
  })
  .strict();

const sourceCitedSourcedRecipeSchema = sourcedRecipeCommonSchema
  .extend({
    trustLabel: z.literal("source-cited"),
    sourceIds: z.array(sourceIdSchema).min(1),
    provenance: sourceCitedProvenanceSchema,
    verification: sourcedSourceCitedVerificationSchema,
    reviewEvidenceId: reviewEvidenceIdSchema,
    sourceFidelityId: sourceFidelityIdSchema,
    lineage: sourcedLineageSchema.optional(),
  })
  .strict();

const regionalHeritageSourcedRecipeSchema = sourcedRecipeCommonSchema
  .extend({
    trustLabel: z.literal("regional-heritage"),
    sourceIds: z.array(sourceIdSchema).min(1),
    provenance: regionalHeritageProvenanceSchema,
    lineage: sourcedLineageSchema,
    verification: sourcedVerificationSchema,
    reviewEvidenceId: reviewEvidenceIdSchema,
    sourceFidelityId: sourceFidelityIdSchema,
  })
  .strict();

const communityTestedSourcedRecipeSchema = sourcedRecipeCommonSchema
  .extend({
    trustLabel: z.literal("community-tested"),
    sourceIds: z.array(sourceIdSchema).min(1),
    provenance: communityTestedProvenanceSchema,
    lineage: sourcedLineageSchema,
    verification: sourcedCommunityVerificationSchema,
    reviewEvidenceId: reviewEvidenceIdSchema,
    sourceFidelityId: sourceFidelityIdSchema,
    communityTestingEvidence: communityTestingEvidenceSchema,
  })
  .strict();

export const sourcedRecipeSchema = z.discriminatedUnion("trustLabel", [
  aiSourcedRecipeSchema,
  sourceCitedSourcedRecipeSchema,
  regionalHeritageSourcedRecipeSchema,
  communityTestedSourcedRecipeSchema,
]);

export const nextRecipeSchema = sourcedRecipeSchema;

export type IngredientQuantity = z.infer<typeof ingredientQuantitySchema>;
export type SeasonWindow = z.infer<typeof seasonWindowSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type SourcedRecipe = z.infer<typeof sourcedRecipeSchema>;
export type NextRecipe = SourcedRecipe;
