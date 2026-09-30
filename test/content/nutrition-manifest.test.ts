import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { nutritionManifestSchema, type NutritionManifest } from "@/lib/content/nutrition-manifest";
import { getAllRecipes } from "@/lib/content/recipes";
import { ingredientCatalogSchema } from "@/lib/domain/ingredient";

const root = process.cwd();

function readManifest(): NutritionManifest {
  return nutritionManifestSchema.parse(
    JSON.parse(readFileSync(join(root, "content", "nutrition", "manifest.json"), "utf8")),
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

describe("USDA nutrition manifest", () => {
  it("records the exact pinned food identities and source values used by the catalog", () => {
    const manifest = readManifest();
    const foodByIngredient = new Map(
      manifest.entries.flatMap((entry) =>
        entry.ingredients
          .filter((ingredient) => ingredient.includedInNutrition)
          .map((ingredient) => [ingredient.ingredientId, ingredient] as const),
      ),
    );

    expect(foodByIngredient.get("ingredient-fresh-coconut-kernel")).toMatchObject({
      sourceFoodId: 170169,
      sourceFoodDescription: "Nuts, coconut meat, raw",
      sourceFoodDataType: "SR Legacy",
    });
    const catalog = ingredientCatalogSchema.parse(
      JSON.parse(readFileSync(join(root, "content", "foods", "ingredients.json"), "utf8")),
    );
    const desiccated = catalog.ingredients.find(
      (ingredient) => ingredient.id === "ingredient-desiccated-coconut",
    );
    expect(desiccated).toMatchObject({
      form: "dried desiccated coconut kernel",
      nutritionSourceIds: ["src-usda-fdc-sr-legacy-2018"],
    });
    expect(foodByIngredient.get("ingredient-rice")).toMatchObject({
      sourceFoodId: 168931,
      sourceFoodDescription: "Rice, white, short-grain, raw, unenriched",
    });
    expect(foodByIngredient.get("ingredient-jaggery")).toMatchObject({
      sourceFoodId: 169655,
      sourceFoodDescription: "Sugars, granulated",
    });
  });

  it("recomputes every included contribution and serving total", () => {
    const manifest = readManifest();

    for (const entry of manifest.entries) {
      const totals = new Map<string, number>();
      for (const ingredient of entry.ingredients) {
        if (!ingredient.includedInNutrition) continue;
        const sourceValues = new Map(
          ingredient.sourceValues.map((value) => [`${value.nutrient}:${value.unit}`, value.amount]),
        );
        for (const contribution of ingredient.contribution) {
          const sourceAmount = sourceValues.get(`${contribution.nutrient}:${contribution.unit}`);
          expect(sourceAmount).toBeDefined();
          expect(contribution.amount).toBe(
            round(((sourceAmount ?? 0) * ingredient.quantity) / 100),
          );
          const key = `${contribution.nutrient}:${contribution.unit}`;
          totals.set(key, (totals.get(key) ?? 0) + contribution.amount);
        }
      }
      for (const total of entry.totals) {
        const key = `${total.nutrient}:${total.unit}`;
        expect(total.amount).toBe(round((totals.get(key) ?? 0) / entry.servingCount));
      }
    }
  });

  it("keeps every recipe nutrition panel synchronized to its manifest entry", () => {
    const manifest = readManifest();
    const recipes = new Map(getAllRecipes().map((recipe) => [recipe.id, recipe]));

    for (const entry of manifest.entries) {
      const recipe = recipes.get(entry.recipeId);
      if (!recipe) throw new Error(`Missing recipe ${entry.recipeId}`);
      expect(recipe.nutrition.values).toEqual(
        entry.totals.map((total) => ({
          nutrient: total.nutrient,
          amount: total.amount,
          unit: total.unit,
          sourceId: manifest.sourceId,
          estimated: true,
        })),
      );
    }
  });
});
