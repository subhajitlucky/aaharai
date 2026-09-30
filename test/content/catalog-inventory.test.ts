import { describe, expect, it } from "vitest";
import { buildRecipeCatalog } from "@/scripts/generate-catalog";

describe("production recipe catalog", () => {
  it("contains exactly twelve unique sourced recipes with category coverage", () => {
    const catalog = buildRecipeCatalog();
    const ids = catalog.recipes.map((recipe) => recipe.id);
    const slugs = catalog.recipes.map((recipe) => recipe.slug);
    const categories = new Set(catalog.recipes.map((recipe) => recipe.mealCategory));

    expect(catalog.recipeCount).toBe(12);
    expect(catalog.recipes).toHaveLength(12);
    expect(new Set(ids).size).toBe(12);
    expect(new Set(slugs).size).toBe(12);
    expect(categories).toEqual(new Set(["breakfast", "main-course", "side-dish"]));
  });
});
