import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { ingredientCatalogSchema } from "@/lib/domain/ingredient";
import { sourceCatalogSchema } from "@/lib/domain/source";

type JsonRecord = Record<string, unknown>;

const root = process.cwd();
const sourcePath = join(root, "content", "sources", "index.json");
const ingredientPath = join(root, "content", "foods", "ingredients.json");
const recipeDirectory = join(root, "content", "recipes");

function readJson(path: string): unknown {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publicRecipeData(): JsonRecord[] {
  return readdirSync(recipeDirectory)
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .sort()
    .map((file) => matter(readFileSync(join(recipeDirectory, file), "utf8")).data as JsonRecord);
}

describe("source and ingredient registries", () => {
  it("registers unique sources that satisfy the shared catalog schema", () => {
    const result = sourceCatalogSchema.safeParse(readJson(sourcePath));
    expect(result.success).toBe(true);
    if (!result.success) return;

    const ids = result.data.sources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(result.data.sources.every((source) => source.reviewedBy.length > 0)).toBe(true);
  });

  it("registers stable ingredients and fully resolved substitutions", () => {
    const result = ingredientCatalogSchema.safeParse(readJson(ingredientPath));
    expect(result.success).toBe(true);
    if (!result.success) return;

    const ingredientIds = new Set(result.data.ingredients.map((ingredient) => ingredient.id));
    const substitutionIds = new Set(result.data.substitutions.map((substitution) => substitution.id));
    const violations: string[] = [];

    for (const ingredient of result.data.ingredients) {
      for (const substitutionId of ingredient.substitutionIds) {
        if (!substitutionIds.has(substitutionId)) violations.push(`${ingredient.id}: missing ${substitutionId}`);
      }
    }
    for (const substitution of result.data.substitutions) {
      if (!ingredientIds.has(substitution.fromIngredientId)) {
        violations.push(`${substitution.id}: missing source ingredient`);
      }
      for (const targetId of substitution.toIngredientIds) {
        if (!ingredientIds.has(targetId)) violations.push(`${substitution.id}: missing ${targetId}`);
      }
    }

    expect(violations).toEqual([]);
    expect(ingredientIds.size).toBe(result.data.ingredients.length);
  });

  it("keeps every public recipe source, nutrition source, ingredient, and substitution reference valid", () => {
    const sourceResult = sourceCatalogSchema.safeParse(readJson(sourcePath));
    const ingredientResult = ingredientCatalogSchema.safeParse(readJson(ingredientPath));
    expect(sourceResult.success).toBe(true);
    expect(ingredientResult.success).toBe(true);
    if (!sourceResult.success || !ingredientResult.success) return;

    const sourceIds = new Set(sourceResult.data.sources.map((source) => source.id));
    const ingredientIds = new Set(ingredientResult.data.ingredients.map((ingredient) => ingredient.id));
    const substitutionIds = new Set(ingredientResult.data.substitutions.map((substitution) => substitution.id));
    const violations: string[] = [];

    for (const [index, recipe] of publicRecipeData().entries()) {
      const recipeSources = Array.isArray(recipe.sourceIds)
        ? recipe.sourceIds.filter((id): id is string => typeof id === "string")
        : [];
      for (const sourceId of recipeSources) {
        if (!sourceIds.has(sourceId)) violations.push(`recipe ${index}: missing source ${sourceId}`);
      }

      const recipeIngredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.filter(isRecord)
        : [];
      for (const ingredient of recipeIngredients) {
        if (typeof ingredient.ingredientId !== "string" || !ingredientIds.has(ingredient.ingredientId)) {
          violations.push(`recipe ${index}: missing ingredient ${String(ingredient.ingredientId)}`);
        }
      }

      const recipeSubstitutions = Array.isArray(recipe.substitutionIds)
        ? recipe.substitutionIds.filter((id): id is string => typeof id === "string")
        : [];
      for (const substitutionId of recipeSubstitutions) {
        if (!substitutionIds.has(substitutionId)) {
          violations.push(`recipe ${index}: missing substitution ${substitutionId}`);
        }
      }

      const nutrition = isRecord(recipe.nutrition) && Array.isArray(recipe.nutrition.values)
        ? recipe.nutrition.values.filter(isRecord)
        : [];
      for (const value of nutrition) {
        if (typeof value.sourceId !== "string" || !sourceIds.has(value.sourceId)) {
          violations.push(`recipe ${index}: missing nutrition source ${String(value.sourceId)}`);
        } else if (!recipeSources.includes(value.sourceId)) {
          violations.push(`recipe ${index}: nutrition source is not canonical`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
