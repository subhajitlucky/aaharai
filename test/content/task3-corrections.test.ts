import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const recipeDirectory = join(root, "content", "recipes");
const publicRecipeFiles = readdirSync(recipeDirectory)
  .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
  .sort();

function readRecipe(file: string): Record<string, unknown> {
  return matter(readFileSync(join(recipeDirectory, file), "utf8")).data as Record<string, unknown>;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as Record<string, unknown>;
}

describe("Task 3 correction contracts", () => {
  it("contains a genuinely sourced Jain recipe without onion or garlic", () => {
    const jainRecipes = publicRecipeFiles
      .map(readRecipe)
      .filter((recipe) => Array.isArray(recipe.dietaryTags) && recipe.dietaryTags.includes("jain"));

    expect(jainRecipes).toHaveLength(1);
    expect(jainRecipes[0].slug).toBe("south-indian-jain-dosa");
    expect(jainRecipes[0].region).toMatchObject({ state: "South India" });
    expect(jainRecipes[0].sourceIds).toContain("src-jain-dosa-mit-2020");
    expect(JSON.stringify(jainRecipes[0])).not.toMatch(/ingredient-(?:onion|garlic)/);
  });

  it("does not depend on IFCT for recipe or nutrition data", () => {
    const contentFiles = [
      "content/sources/index.json",
      "content/foods/ingredients.json",
      ...publicRecipeFiles.map((file) => `content/recipes/${file}`),
    ];
    const offenders = contentFiles.filter((file) =>
      readFileSync(join(root, file), "utf8").includes("src-ifct-2017"),
    );

    expect(offenders).toEqual([]);
  });

  it("records review evidence with an accountable non-human role", () => {
    const reviewManifest = readJson("content/reviews/review-evidence.json");
    const entries = reviewManifest.entries as Array<Record<string, unknown>>;

    expect(entries).toHaveLength(12);
    expect(entries.every((entry) => entry.role === "Aaharai AI-assisted source audit")).toBe(true);
    expect(entries.every((entry) => entry.reviewedAt === "2026-09-25")).toBe(true);
    expect(entries.every((entry) => Array.isArray(entry.sourceChecks) && entry.sourceChecks.length > 0)).toBe(true);
    expect(entries.every((entry) => Array.isArray(entry.limitations) && entry.limitations.length > 0)).toBe(true);
  });

  it("has a versioned nutrition manifest with USDA food codes and computed contributions", () => {
    const manifest = readJson("content/nutrition/manifest.json");
    const entries = manifest.entries as Array<Record<string, unknown>>;

    expect(manifest.version).toBe(1);
    expect(manifest.sourceId).toBe("src-usda-fdc-sr-legacy-2018");
    expect(entries).toHaveLength(12);
    expect(
      entries.every((entry) => Array.isArray(entry.ingredients) && entry.ingredients.length > 0),
    ).toBe(true);
    expect(
      entries.every((entry) =>
        (entry.ingredients as Array<Record<string, unknown>>).every((ingredient) =>
          ingredient.includedInNutrition === false ||
          (typeof ingredient.sourceFoodId === "number" && Array.isArray(ingredient.sourceValues)),
        ),
      ),
    ).toBe(true);
  });

  it("keeps one-way substitutions and identifies base ingredients", () => {
    const catalog = readJson("content/foods/ingredients.json");
    const ingredients = catalog.ingredients as Array<Record<string, unknown>>;
    const substitutions = catalog.substitutions as Array<Record<string, unknown>>;
    const ingredientById = new Map(ingredients.map((ingredient) => [String(ingredient.id), ingredient]));

    expect(ingredients.every((ingredient) => typeof ingredient.baseIngredient === "boolean")).toBe(true);
    expect(
      substitutions.every((substitution) => {
        const source = ingredientById.get(String(substitution.fromIngredientId));
        const targets = (substitution.toIngredientIds as string[]).map((id) => ingredientById.get(id));
        return source && targets.every(Boolean) && !(source.baseIngredient === true && targets.every((target) => target?.baseIngredient === true));
      }),
    ).toBe(true);
    expect(
      substitutions.some((substitution) => {
        const reverse = substitutions.find(
          (candidate) =>
            candidate.id !== substitution.id &&
            candidate.fromIngredientId === (substitution.toIngredientIds as string[])[0] &&
            (candidate.toIngredientIds as string[]).includes(String(substitution.fromIngredientId)),
        );
        return reverse !== undefined;
      }),
    ).toBe(false);
  });

  it("has explicit source-fidelity records for the high-risk recipes", () => {
    const fidelity = readJson("content/source-fidelity.json");
    const records = fidelity.records as Array<Record<string, unknown>>;
    const nadia = records.find((record) => record.recipeId === "recipe-odisha-nadia-pura-idli");
    const biryani = records.find((record) => record.recipeId === "recipe-punjab-chicken-biryani");

    expect(records).toHaveLength(12);
    expect(nadia?.sourceTerms).not.toContain("jaggery");
    expect(nadia?.sourceTerms).toContain("sugar");
    expect(nadia?.sourceTerms).toContain("brown sugar");
    expect(String(nadia?.adaptations)).toMatch(/jaggery/i);
    expect(biryani?.sourceTerms).toContain("garam masala");
    expect(biryani?.sourceTerms).toContain("green cardamom");
    expect(biryani?.sourceTerms).toContain("black cardamom");
    expect(records.every((record) => typeof record.boundary === "string" && record.boundary.length > 0)).toBe(true);
  });

  it("retains the origin/main empty-state branch without Task 10 redesign copy", () => {
    const indexSource = readFileSync(join(root, "app/recipes/page.tsx"), "utf8");

    expect(indexSource).toContain("recipes.length === 0");
    expect(indexSource).toContain("No verified recipes yet");
    expect(indexSource).not.toContain("Recipes that carry their sources.");
  });

  it("uses the requested validation scripts", () => {
    const packageJson = readJson("package.json");
    const scripts = packageJson.scripts as Record<string, string>;

    expect(scripts.build).toContain("validate:data");
    expect(scripts["validate:data"]).toContain("scripts/validate-data.ts");
    expect(scripts.check).toContain("build");
  });
});
