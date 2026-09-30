import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { sourcedRecipeSchema } from "@/lib/content/schema";

const recipeDirectory = join(process.cwd(), "content", "recipes");
const publicRecipeFiles = readdirSync(recipeDirectory)
  .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
  .sort();

const forbiddenLanguage = [
  /\[example\]/i,
  /example-bot/i,
  /\b(?:demo|demonstration|sample|mock|fixture|placeholder|replace|replacement)\b/i,
  /replace\s+and\s+delete/i,
  /replace\s+with\s+(a\s+)?real/i,
];

type RecipeData = Record<string, unknown>;

function readRecipe(file: string): RecipeData {
  const parsed = matter(readFileSync(join(recipeDirectory, file), "utf8"));
  return parsed.data as RecipeData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

describe("public recipe content", () => {
  it("contains no demonstration or replacement placeholders", () => {
    const offenders: string[] = [];

    for (const file of publicRecipeFiles) {
      const raw = readFileSync(join(recipeDirectory, file), "utf8");
      if (forbiddenLanguage.some((pattern) => pattern.test(raw))) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("validates every public recipe with the sourced contract", () => {
    const invalidFiles = publicRecipeFiles.filter(
      (file) => !sourcedRecipeSchema.safeParse(readRecipe(file)).success,
    );

    expect(invalidFiles).toEqual([]);
  });

  it("rejects nutrition values without source IDs and estimate status", () => {
    const violations: string[] = [];

    for (const file of publicRecipeFiles) {
      const data = readRecipe(file);
      const nutrition = data.nutrition;
      if (!isRecord(nutrition) || !Array.isArray(nutrition.values)) {
        violations.push(`${file}: missing nutrition values`);
        continue;
      }

      for (const [index, value] of nutrition.values.entries()) {
        if (
          !isRecord(value) ||
          typeof value.amount !== "number" ||
          typeof value.sourceId !== "string" ||
          value.sourceId.length === 0 ||
          typeof value.estimated !== "boolean"
        ) {
          violations.push(`${file}: nutrition.values[${index}]`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps trust labels, provenance, sources, and reviewers consistent", () => {
    const violations: string[] = [];
    const supportedTrustLabels = new Set([
      "source-cited",
      "regional-heritage",
      "community-tested",
      "ai-created",
    ]);

    for (const file of publicRecipeFiles) {
      const data = readRecipe(file);
      const trustLabel = data.trustLabel;
      const provenance = data.provenance;
      const sourceIds = data.sourceIds;
      const verification = data.verification;

      if (typeof trustLabel !== "string" || !supportedTrustLabels.has(trustLabel)) {
        violations.push(`${file}: unsupported trust label`);
        continue;
      }
      if (!isRecord(provenance) || provenance.claim !== trustLabel) {
        violations.push(`${file}: provenance does not match trust label`);
      }
      if (!Array.isArray(sourceIds)) {
        violations.push(`${file}: missing source IDs`);
      } else if (trustLabel === "ai-created" && sourceIds.length !== 0) {
        violations.push(`${file}: AI-created recipe has source IDs`);
      } else if (trustLabel !== "ai-created" && sourceIds.length === 0) {
        violations.push(`${file}: non-AI recipe has no source IDs`);
      }
      if (trustLabel !== "ai-created") {
        if (!isRecord(verification)) {
          violations.push(`${file}: missing reviewer`);
        } else {
          if (typeof verification.verifierName !== "string" || verification.verifierName.length === 0) {
            violations.push(`${file}: missing reviewer name`);
          }
          if (typeof verification.verifiedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(verification.verifiedAt)) {
            violations.push(`${file}: invalid review date`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

describe("recipe inventory", () => {
  it("has a public seed catalog and keeps templates out of it", () => {
    expect(publicRecipeFiles.length).toBe(12);
    expect(publicRecipeFiles).not.toContain("_TEMPLATE.mdx");
    expect(publicRecipeFiles.every((file) => basename(file, ".mdx") === file.slice(0, -4))).toBe(true);
  });

  it("includes wrap-around seasons and the required dietary coverage", () => {
    const recipes = publicRecipeFiles.map((file) => readRecipe(file));
    const dietaryTags = new Set(recipes.flatMap((recipe) =>
      Array.isArray(recipe.dietaryTags)
        ? recipe.dietaryTags.filter((tag): tag is string => typeof tag === "string")
        : [],
    ));

    expect(recipes.some((recipe) => isRecord(recipe.seasonWindow) && recipe.seasonWindow.calendar === "cross-year")).toBe(true);
    expect(dietaryTags.has("vegan")).toBe(true);
    expect(dietaryTags.has("jain")).toBe(true);
    expect(dietaryTags.has("no-onion-garlic")).toBe(true);
    expect(dietaryTags.has("non-veg")).toBe(true);
  });

  it("has no missing public recipe directory", () => {
    expect(existsSync(recipeDirectory)).toBe(true);
  });
});
