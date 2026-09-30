import { z } from "zod";
import { sourceIdSchema } from "@/lib/domain/source";

export const nutritionUnitSchema = z.enum(["kcal", "g", "mg", "µg", "IU"]);

const nutritionTextSchema = z.string().trim().min(1);

const nutritionNutrientSchema = z
  .string()
  .transform((nutrient) => nutrient.trim().toLowerCase().replace(/\s+/g, " "))
  .refine((nutrient) => nutrient.length > 0, "nutrient must not be empty");

export const nutritionValueSchema = z.object({
  nutrient: nutritionNutrientSchema,
  amount: z.number().finite().nonnegative(),
  unit: nutritionUnitSchema,
  sourceId: sourceIdSchema,
  estimated: z.boolean(),
});

export const nutritionPanelSchema = z
  .object({
    servingLabel: nutritionTextSchema,
    values: z.array(nutritionValueSchema).min(1),
  })
  .superRefine((panel, context) => {
    const seenKeys = new Set<string>();

    panel.values.forEach((value, index) => {
      const key = `${value.nutrient}\u0000${value.unit}`;
      if (seenKeys.has(key)) {
        context.addIssue({
          code: "custom",
          path: ["values", index, "nutrient"],
          message: "nutrition entries must have unique nutrient and unit pairs",
        });
      }
      seenKeys.add(key);
    });
  });

export type NutritionUnit = z.infer<typeof nutritionUnitSchema>;
export type NutritionValue = z.infer<typeof nutritionValueSchema>;
export type NutritionPanel = z.infer<typeof nutritionPanelSchema>;
