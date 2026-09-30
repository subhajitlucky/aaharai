import { describe, expect, it } from "vitest";
import { buildRecipeCatalog } from "@/scripts/generate-catalog";

describe("production recipe catalog", () => {
  it("contains sixteen unique sourced recipes with category coverage", () => {
    const catalog = buildRecipeCatalog();
    const ids = catalog.recipes.map((recipe) => recipe.id);
    const slugs = catalog.recipes.map((recipe) => recipe.slug);
    const categories = new Set(catalog.recipes.map((recipe) => recipe.mealCategory));

    expect(catalog.recipeCount).toBe(16);
    expect(catalog.recipes).toHaveLength(16);
    expect(new Set(ids).size).toBe(16);
    expect(new Set(slugs).size).toBe(16);
    expect(categories).toEqual(
      new Set(["breakfast", "main-course", "side-dish", "snack", "dessert"]),
    );
  });

  it("covers the regions the transcribed records claim", () => {
    const catalog = buildRecipeCatalog();
    const states = new Set(catalog.recipes.map((recipe) => recipe.region.state));

    // Jammu and Kashmir, Meghalaya and Sikkim entered the archive with the
    // records transcribed from the ICAR rice-foods source.
    expect(states).toContain("Jammu and Kashmir");
    expect(states).toContain("Meghalaya");
    expect(states).toContain("Sikkim");
  });
});
