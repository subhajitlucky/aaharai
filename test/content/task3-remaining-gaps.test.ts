import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import config from "../../vitest.config";

const root = process.cwd();
const recipeDirectory = join(root, "content", "recipes");

function recipeFile(file: string): string {
  return readFileSync(join(recipeDirectory, file), "utf8");
}

function recipeData(file: string): Record<string, unknown> {
  return matter(recipeFile(file)).data as Record<string, unknown>;
}

function jsonFile(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as Record<string, unknown>;
}

function recordFor(records: Array<Record<string, unknown>>, recipeId: string): Record<string, unknown> {
  const record = records.find((candidate) => candidate.recipeId === recipeId);
  if (!record) throw new Error(`Missing evidence record ${recipeId}`);
  return record;
}

function manifestEntry(recipeId: string): Record<string, unknown> {
  const manifest = jsonFile("content/nutrition/manifest.json");
  const entries = manifest.entries as Array<Record<string, unknown>>;
  return recordFor(entries, recipeId);
}

function ingredientsFor(recipe: Record<string, unknown>): Array<Record<string, unknown>> {
  return recipe.ingredients as Array<Record<string, unknown>>;
}

describe("Task 3 remaining gap regressions", () => {
  it("records Nadia jaggery as an adaptation of the source sugar forms", () => {
    const recipe = recipeData("odisha-nadia-pura-idli.mdx");
    const raw = recipeFile("odisha-nadia-pura-idli.mdx");
    const fidelity = recordFor(
      (jsonFile("content/source-fidelity.json").records as Array<Record<string, unknown>>),
      "recipe-odisha-nadia-pura-idli",
    );
    const review = recordFor(
      (jsonFile("content/reviews/review-evidence.json").entries as Array<Record<string, unknown>>),
      "recipe-odisha-nadia-pura-idli",
    );
    const jaggery = ingredientsFor(recipe).find((ingredient) => ingredient.ingredientId === "ingredient-jaggery");
    const manifestJaggery = (manifestEntry("recipe-odisha-nadia-pura-idli").ingredients as Array<Record<string, unknown>>).find(
      (ingredient) => ingredient.ingredientId === "ingredient-jaggery",
    );

    expect(jaggery).toBeDefined();
    expect(fidelity.sourceTerms).toEqual(expect.arrayContaining(["sugar", "brown sugar"]));
    expect(fidelity.sourceTerms).not.toContain("jaggery");
    expect(String(fidelity.adaptations)).toMatch(/jaggery/i);
    expect(String(review.adaptations)).toMatch(/jaggery/i);
    expect(`${raw}${JSON.stringify(fidelity)}${JSON.stringify(review)}`).not.toMatch(/no sugar substitution/i);
    expect(manifestJaggery).toMatchObject({ sourceFoodId: 169655 });
    expect(String(manifestJaggery?.adaptation)).toMatch(/jaggery[\s\S]*sugar|source sugar[\s\S]*jaggery/i);
  });

  it("uses the source desiccated coconut form for Pongal and its USDA row", () => {
    const recipe = recipeData("tamil-pongal.mdx");
    const raw = recipeFile("tamil-pongal.mdx");
    const ingredients = ingredientsFor(recipe);
    const coconut = ingredients.find((ingredient) => ingredient.ingredientId === "ingredient-desiccated-coconut");
    const manifestCoconut = (manifestEntry("recipe-tamil-pongal").ingredients as Array<Record<string, unknown>>).find(
      (ingredient) => ingredient.ingredientId === "ingredient-desiccated-coconut",
    );
    const fidelity = recordFor(
      (jsonFile("content/source-fidelity.json").records as Array<Record<string, unknown>>),
      "recipe-tamil-pongal",
    );
    const review = recordFor(
      (jsonFile("content/reviews/review-evidence.json").entries as Array<Record<string, unknown>>),
      "recipe-tamil-pongal",
    );
    const relation = (jsonFile("content/foods/ingredients.json").substitutions as Array<Record<string, unknown>>).find(
      (substitution) => substitution.id === "sub-desiccated-coconut-coconut-milk",
    );

    expect(coconut).toBeDefined();
    expect(recipe.substitutionIds).toContain("sub-desiccated-coconut-coconut-milk");
    expect(relation).toMatchObject({
      fromIngredientId: "ingredient-desiccated-coconut",
      toIngredientIds: ["ingredient-coconut-milk"],
    });
    expect(ingredients.some((ingredient) => ingredient.ingredientId === "ingredient-fresh-coconut-kernel")).toBe(false);
    expect(manifestCoconut).toMatchObject({ sourceFoodId: 170170 });
    expect(String(manifestCoconut?.sourceFoodDescription)).toMatch(/dried.*desiccated/i);
    expect(fidelity.sourceTerms).toContain("desiccated coconut");
    expect(String(fidelity.adaptations)).toMatch(/desiccated coconut/i);
    expect(String(review.adaptations)).toMatch(/desiccated coconut/i);
    expect(raw).toMatch(/desiccated coconut/i);
  });

  it("records Biryani masala and black cardamom deviations everywhere", () => {
    const raw = recipeFile("punjab-chicken-biryani.mdx");
    const fidelity = recordFor(
      (jsonFile("content/source-fidelity.json").records as Array<Record<string, unknown>>),
      "recipe-punjab-chicken-biryani",
    );
    const review = recordFor(
      (jsonFile("content/reviews/review-evidence.json").entries as Array<Record<string, unknown>>),
      "recipe-punjab-chicken-biryani",
    );
    const manifest = manifestEntry("recipe-punjab-chicken-biryani");
    const excludedMasala = (manifest.ingredients as Array<Record<string, unknown>>).find(
      (ingredient) => ingredient.ingredientId === "ingredient-garam-masala",
    );
    const deviations = `${JSON.stringify(fidelity.adaptations)} ${JSON.stringify(review.adaptations)}`;

    expect(fidelity.sourceTerms).toEqual(expect.arrayContaining(["biryani masala", "black cardamom"]));
    expect(deviations).toMatch(/biryani masala[\s\S]*black cardamom|black cardamom[\s\S]*biryani masala/i);
    expect(deviations).toMatch(/deviation|omitted|not separately|declared/i);
    expect(raw).toMatch(/biryani masala/i);
    expect(raw).toMatch(/black cardamom/i);
    expect(excludedMasala?.includedInNutrition).toBe(false);
    expect(String(excludedMasala?.exclusionReason)).toMatch(/biryani masala|black cardamom/i);
  });

  it("uses exact manifest forms in the four nutrition prose passages", () => {
    const cases = [
      {
        file: "bihar-dal-pitha.mdx",
        required: ["white rice flour", "mapped"],
        forbidden: ["rice-milled row", "the spice, salt, and water quantities are recorded for method fidelity but are excluded"],
      },
      {
        file: "kerala-appam.mdx",
        required: ["granulated sugar", "yeast row is included"],
        forbidden: ["cane-jaggery row", "yeast, salt, and water are excluded"],
      },
      {
        file: "maharashtra-thalipeeth.mdx",
        required: ["rice flour", "chickpea", "mapped spices"],
        forbidden: ["rice-milled", "Bengal-gram-dal rows", "salt, spices, and water are excluded"],
      },
      {
        file: "uttarakhand-madue-ki-bari.mdx",
        required: ["generic raw millet"],
        forbidden: ["finger-millet row"],
      },
      {
        file: "odisha-nadia-pura-idli.mdx",
        required: ["mapped cardamom"],
        forbidden: ["salt, cardamom, baking soda, and water are excluded"],
      },
      {
        file: "punjab-chicken-biryani.mdx",
        required: ["mapped whole spices"],
        forbidden: ["spices, salt, and cooking water are excluded"],
      },
      {
        file: "bengal-khichuri.mdx",
        required: ["mapped spices"],
        forbidden: ["seasonings excluded from the macro total"],
      },
      {
        file: "gujarati-dhokla.mdx",
        required: ["mapped seasonings"],
        forbidden: ["seasonings, salt, and water are excluded"],
      },
      {
        file: "karnataka-vangi-bhaat.mdx",
        required: ["mapped spices"],
        forbidden: ["seasonings and salt are excluded"],
      },
      {
        file: "madhya-pradesh-peas-carrot-pulao.mdx",
        required: ["mapped whole spices"],
        forbidden: ["whole spices, salt, and water are excluded"],
      },
    ] as const;

    for (const testCase of cases) {
      const raw = recipeFile(testCase.file).toLowerCase();
      for (const phrase of testCase.required) expect(raw).toContain(phrase.toLowerCase());
      for (const phrase of testCase.forbidden) expect(raw).not.toContain(phrase.toLowerCase());
    }
  });

  it("configures planned stable coverage directories without treating legacy lib/ai.ts as the future adapter", () => {
    const thresholds = (config.test?.coverage?.thresholds ?? {}) as Record<string, unknown>;
    const targetDirectories = ["lib/domain/**", "lib/planner/**", "lib/storage/**", "lib/ai/**"];

    expect(Object.keys(thresholds)).toEqual(expect.arrayContaining(targetDirectories));
    expect(Object.keys(thresholds)).not.toContain("lib/ai.ts");
  });

  it("does not call unregistered Madue or Biryani variations registered substitutions", () => {
    const madue = recipeFile("uttarakhand-madue-ki-bari.mdx");
    const biryani = recipeFile("punjab-chicken-biryani.mdx");

    expect(madue).toMatch(/unregistered variation/i);
    expect(madue).not.toMatch(/registered substitution/i);
    expect(biryani).toMatch(/unregistered variation/i);
    expect(biryani).not.toMatch(/registered substitution/i);
  });
});
