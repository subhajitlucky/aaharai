import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllRecipes } from "@/lib/content/recipes";

export const CATALOG_OUTPUT_PATH = join(
  process.cwd(),
  "public",
  "data",
  "catalog.json",
);

export type RecipeCatalog = {
  version: 1;
  recipeCount: number;
  recipes: ReturnType<typeof getAllRecipes>;
};

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareRecipes(
  left: ReturnType<typeof getAllRecipes>[number],
  right: ReturnType<typeof getAllRecipes>[number],
): number {
  const titleOrder = compareText(left.title, right.title);
  return titleOrder !== 0 ? titleOrder : compareText(left.slug, right.slug);
}

export function buildRecipeCatalog(): RecipeCatalog {
  const recipes = [...getAllRecipes()].sort(compareRecipes);
  return {
    version: 1,
    recipeCount: recipes.length,
    recipes,
  };
}

export function serializeRecipeCatalog(catalog: RecipeCatalog): string {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

export function generateCatalog(outputPath = CATALOG_OUTPUT_PATH): string {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serializeRecipeCatalog(buildRecipeCatalog()), "utf8");
  return outputPath;
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  const outputPath = generateCatalog();
  console.log(`Generated ${relative(process.cwd(), outputPath)}`);
}
