import { z } from "zod";
import { allergenIdsSchema } from "@/lib/domain/allergen";
import {
  dietaryTagSchema,
  ingredientIdSchema,
  ingredientUnitSchema,
  substitutionIdSchema,
} from "@/lib/content/schema";
import { sourceIdSchema } from "@/lib/domain/source";

const regionalNameSchema = z.object({
  name: z.string().trim().min(1),
  region: z.string().trim().min(1),
}).strict();

export const ingredientCatalogEntrySchema = z.object({
  id: ingredientIdSchema,
  canonicalName: z.string().trim().min(1),
  form: z.string().trim().min(1),
  regionalNames: z.array(regionalNameSchema),
  dietTags: z.array(dietaryTagSchema),
  allergenIds: allergenIdsSchema,
  defaultUnit: ingredientUnitSchema,
  baseIngredient: z.boolean(),
  nutritionSourceIds: z.array(sourceIdSchema),
  nutritionNote: z.string().trim().min(1).optional(),
  substitutionIds: z.array(substitutionIdSchema),
}).strict();

export const ingredientSubstitutionSchema = z.object({
  id: substitutionIdSchema,
  fromIngredientId: ingredientIdSchema,
  toIngredientIds: z.array(ingredientIdSchema).min(1),
  note: z.string().trim().min(1),
}).strict();

export const ingredientCatalogSchema = z.object({
  version: z.literal(1),
  ingredients: z.array(ingredientCatalogEntrySchema),
  substitutions: z.array(ingredientSubstitutionSchema),
}).strict();

export type IngredientCatalogEntry = z.infer<typeof ingredientCatalogEntrySchema>;
export type IngredientSubstitution = z.infer<typeof ingredientSubstitutionSchema>;
export type IngredientCatalog = z.infer<typeof ingredientCatalogSchema>;
