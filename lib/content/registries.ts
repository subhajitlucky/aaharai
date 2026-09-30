import { readFileSync } from "node:fs";
import { join } from "node:path";
import { nutritionManifestSchema } from "@/lib/content/nutrition-manifest";
import { sourceFidelityManifestSchema } from "@/lib/domain/fidelity";
import { ingredientCatalogSchema } from "@/lib/domain/ingredient";
import { reviewEvidenceManifestSchema } from "@/lib/domain/review";
import { sourceCatalogSchema } from "@/lib/domain/source";

export const CONTENT_SOURCE_PATH = join("content", "sources", "index.json");
export const CONTENT_INGREDIENT_PATH = join("content", "foods", "ingredients.json");
export const CONTENT_NUTRITION_PATH = join("content", "nutrition", "manifest.json");
export const CONTENT_REVIEW_PATH = join("content", "reviews", "review-evidence.json");
export const CONTENT_FIDELITY_PATH = join("content", "source-fidelity.json");

export type ContentRegistries = {
  sources: ReturnType<typeof sourceCatalogSchema.parse>;
  ingredients: ReturnType<typeof ingredientCatalogSchema.parse>;
  nutritionManifest: ReturnType<typeof nutritionManifestSchema.parse>;
  reviewEvidence: ReturnType<typeof reviewEvidenceManifestSchema.parse>;
  sourceFidelity: ReturnType<typeof sourceFidelityManifestSchema.parse>;
};

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`[aaharai] Cannot read content registry "${path}". ${String(error)}`);
  }
}

function parseRegistry<T>(path: string, schema: { parse: (value: unknown) => T }): T {
  return schema.parse(readJson(path));
}

export function loadContentRegistries(root = process.cwd()): ContentRegistries {
  return {
    sources: parseRegistry(join(root, CONTENT_SOURCE_PATH), sourceCatalogSchema),
    ingredients: parseRegistry(join(root, CONTENT_INGREDIENT_PATH), ingredientCatalogSchema),
    nutritionManifest: parseRegistry(join(root, CONTENT_NUTRITION_PATH), nutritionManifestSchema),
    reviewEvidence: parseRegistry(join(root, CONTENT_REVIEW_PATH), reviewEvidenceManifestSchema),
    sourceFidelity: parseRegistry(join(root, CONTENT_FIDELITY_PATH), sourceFidelityManifestSchema),
  };
}
