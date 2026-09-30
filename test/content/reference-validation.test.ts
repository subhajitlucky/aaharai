import { describe, expect, it } from "vitest";
import { getAllRecipes } from "@/lib/content/recipes";
import { loadContentRegistries } from "@/lib/content/registries";
import { validateContentReferences } from "@/lib/content/reference-validation";

function productionInput() {
  return {
    ...loadContentRegistries(),
    recipes: getAllRecipes(),
  };
}

describe("shared content reference validation", () => {
  it("accepts the production registries and recipe references", () => {
    expect(validateContentReferences(productionInput())).toEqual([]);
  });

  it("rejects an unsupported source reviewer role or date", () => {
    const input = structuredClone(productionInput());
    input.sources.sources[0].reviewedBy = "Community expert" as never;
    input.sources.sources[1].reviewedAt = "2026-09-24" as never;

    expect(validateContentReferences(input)).toEqual(
      expect.arrayContaining([
        '[sources.src-icar-rice-foods-2015] reviewer role is not the accountable source-audit role',
        '[sources.src-icar-uttarakhand-cuisine-2023] review date is not the fixed audit date',
      ]),
    );
  });

  it("rejects recipe evidence IDs that point at the wrong record", () => {
    const input = structuredClone(productionInput());
    const recipe = input.recipes.find((candidate) => candidate.trustLabel === "source-cited");
    if (!recipe) throw new Error("Expected a source-cited recipe fixture");
    recipe.reviewEvidenceId = "review-other" as never;
    recipe.sourceFidelityId = "fidelity-other" as never;

    expect(validateContentReferences(input)).toEqual(
      expect.arrayContaining([
        "[recipes.recipe-bengal-khichuri] review evidence ID does not match the recipe",
        "[recipes.recipe-bengal-khichuri] source-fidelity ID does not match the recipe",
      ]),
    );
  });

  it("rejects a dangling recipe source", () => {
    const input = structuredClone(productionInput());
    input.recipes[0].sourceIds = ["src-missing"];

    expect(validateContentReferences(input)).toContain(
      '[recipes.recipe-bengal-khichuri] missing source "src-missing"',
    );
  });

  it("rejects a dangling substitution target", () => {
    const input = structuredClone(productionInput());
    input.ingredients.substitutions[0].toIngredientIds = ["ingredient-missing"];

    expect(validateContentReferences(input)).toContain(
      '[substitutions.sub-fresh-coconut-coconut-milk] target ingredient "ingredient-missing" does not exist',
    );
  });

  it("rejects base-to-base and reverse substitution edges", () => {
    const baseToBase = structuredClone(productionInput());
    baseToBase.ingredients.substitutions[0].toIngredientIds = ["ingredient-milk"];
    expect(validateContentReferences(baseToBase)).toContain(
      '[substitutions.sub-fresh-coconut-coconut-milk] source and target "ingredient-milk" are both base ingredients',
    );

    const reverse = structuredClone(productionInput());
    reverse.ingredients.substitutions.push({
      id: "sub-coconut-milk-fresh-coconut",
      fromIngredientId: "ingredient-coconut-milk",
      toIngredientIds: ["ingredient-fresh-coconut-kernel"],
      note: "Invalid reverse edge used only to exercise validation.",
    });
    reverse.ingredients.substitutions.find(
      (substitution) => substitution.id === "sub-fresh-coconut-coconut-milk",
    )!.toIngredientIds = ["ingredient-coconut-milk"];
    expect(validateContentReferences(reverse)).toContain(
      '[substitutions.sub-fresh-coconut-coconut-milk] reverse substitution "sub-coconut-milk-fresh-coconut" is not allowed',
    );
  });

  it("rejects a manifest form that does not match the ingredient catalog", () => {
    const input = structuredClone(productionInput());
    const rice = input.nutritionManifest.entries[0].ingredients.find(
      (ingredient) => ingredient.ingredientId === "ingredient-rice",
    );
    if (!rice) throw new Error("Expected the rice manifest fixture");
    rice.form = "milled coconut";

    expect(validateContentReferences(input)).toContain(
      "[recipes.recipe-bengal-khichuri] nutrition manifest ingredient 0 does not match recipe form or quantity",
    );
  });

  it("rejects a substitution whose source is absent from the recipe", () => {
    const input = structuredClone(productionInput());
    const dosa = input.recipes.find((recipe) => recipe.id === "recipe-south-indian-jain-dosa");
    if (!dosa) throw new Error("Expected the Jain dosa fixture");
    dosa.substitutionIds = ["sub-milk-coconut-milk"];

    expect(validateContentReferences(input)).toContain(
      '[recipes.recipe-south-indian-jain-dosa] substitution "sub-milk-coconut-milk" source is not an ingredient in the recipe',
    );
  });

  it("rejects missing high-risk source-form adaptations", () => {
    const input = structuredClone(productionInput());
    const nadia = input.sourceFidelity.records.find(
      (record) => record.recipeId === "recipe-odisha-nadia-pura-idli",
    );
    const biryani = input.sourceFidelity.records.find(
      (record) => record.recipeId === "recipe-punjab-chicken-biryani",
    );
    if (!nadia || !biryani) throw new Error("Expected high-risk fidelity fixtures");
    nadia.sourceTerms = nadia.sourceTerms.filter((term) => term !== "brown sugar");
    biryani.sourceTerms = biryani.sourceTerms.filter((term) => term !== "black cardamom");

    const issues = validateContentReferences(input);
    expect(issues).toContain(
      "[recipes.recipe-odisha-nadia-pura-idli] Nadia Pura Idli fidelity must record the jaggery adaptation from source sugar forms",
    );
    expect(issues).toContain(
      '[recipes.recipe-punjab-chicken-biryani] biryani fidelity must record "black cardamom"',
    );
  });

  it("rejects duplicate recipe slugs", () => {
    const input = structuredClone(productionInput());
    input.recipes[1].slug = input.recipes[0].slug;

    expect(validateContentReferences(input)).toContain(
      `[recipes.${input.recipes[1].id}] duplicate recipe slug "${input.recipes[0].slug}"`,
    );
  });

  it("rejects a manifest with an unregistered source", () => {
    const input = structuredClone(productionInput());
    input.nutritionManifest.sourceId = "src-missing";

    expect(validateContentReferences(input)).toEqual([
      "[nutritionManifest] manifest source is not registered",
    ]);
  });
});
