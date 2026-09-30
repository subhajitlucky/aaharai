import { z } from "zod";
import { sourceIdSchema } from "@/lib/domain/source";
import { nutritionUnitSchema } from "@/lib/domain/nutrition";
import {
  ingredientIdSchema,
  ingredientUnitSchema,
  recipeIdSchema,
} from "@/lib/content/schema";

const manifestTextSchema = z.string().trim().min(1);
const nutrientNameSchema = z
  .string()
  .transform((value) => value.trim().toLowerCase().replace(/\s+/g, " "))
  .refine((value) => value.length > 0, "manifest nutrient must not be empty");

const manifestNutrientSchema = z
  .object({
    nutrient: nutrientNameSchema,
    amount: z.number().finite().nonnegative(),
    unit: nutritionUnitSchema,
  })
  .strict();

const includedManifestIngredientSchema = z
  .object({
    ingredientId: ingredientIdSchema,
    quantity: z.number().finite().positive(),
    unit: ingredientUnitSchema,
    form: manifestTextSchema,
    sourceFoodId: z.number().int().positive(),
    sourceFoodDescription: manifestTextSchema,
    sourceFoodDataType: manifestTextSchema,
    sourceValues: z.array(manifestNutrientSchema).min(1),
    contribution: z.array(manifestNutrientSchema).min(1),
    includedInNutrition: z.literal(true),
    adaptation: manifestTextSchema.optional(),
  })
  .strict();

const excludedManifestIngredientSchema = z
  .object({
    ingredientId: ingredientIdSchema,
    quantity: z.number().finite().positive(),
    unit: ingredientUnitSchema,
    form: manifestTextSchema,
    sourceFoodId: z.literal(null),
    sourceValues: z.array(manifestNutrientSchema).length(0),
    contribution: z.array(manifestNutrientSchema).length(0),
    includedInNutrition: z.literal(false),
    exclusionReason: manifestTextSchema,
  })
  .strict();

export const nutritionManifestIngredientSchema = z.discriminatedUnion("includedInNutrition", [
  includedManifestIngredientSchema,
  excludedManifestIngredientSchema,
]);

export const nutritionManifestEntrySchema = z
  .object({
    recipeId: recipeIdSchema,
    servingCount: z.number().int().positive(),
    ingredients: z.array(nutritionManifestIngredientSchema).min(1),
    totals: z.array(manifestNutrientSchema).min(1),
    limitations: z.array(manifestTextSchema).min(1),
  })
  .strict();

export const nutritionManifestSchema = z
  .object({
    version: z.literal(1),
    sourceId: sourceIdSchema,
    calculationMethod: manifestTextSchema,
    entries: z.array(nutritionManifestEntrySchema).min(1),
  })
  .strict();

export type NutritionManifestIngredient = z.infer<typeof nutritionManifestIngredientSchema>;
export type NutritionManifestEntry = z.infer<typeof nutritionManifestEntrySchema>;
export type NutritionManifest = z.infer<typeof nutritionManifestSchema>;
