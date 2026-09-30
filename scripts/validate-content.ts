import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentRegistries } from "@/lib/content/registries";
import { validateContentReferences } from "@/lib/content/reference-validation";
import { loadRecipesFromDirectory } from "@/lib/content/recipes";

export type ContentValidationSummary = {
  recipeCount: number;
  sourceCount: number;
  ingredientCount: number;
  nutritionEntryCount: number;
  reviewEntryCount: number;
  fidelityRecordCount: number;
};

export function validateContentData(root = process.cwd()): ContentValidationSummary {
  const registries = loadContentRegistries(root);
  const recipes = loadRecipesFromDirectory(join(root, "content", "recipes"));
  const issues = validateContentReferences({ ...registries, recipes });
  if (issues.length > 0) {
    throw new Error(
      [
        `[aaharai] CONTENT REFERENCE VALIDATION FAILED - ${issues.length} issue(s).`,
        ...issues.map((message) => `     - ${message}`),
      ].join("\n"),
    );
  }
  return {
    recipeCount: recipes.length,
    sourceCount: registries.sources.sources.length,
    ingredientCount: registries.ingredients.ingredients.length,
    nutritionEntryCount: registries.nutritionManifest.entries.length,
    reviewEntryCount: registries.reviewEvidence.entries.length,
    fidelityRecordCount: registries.sourceFidelity.records.length,
  };
}

export function printContentValidationSuccess(summary: ContentValidationSummary): void {
  console.log(
    `Validated ${summary.recipeCount} public recipe file(s), ${summary.sourceCount} source(s), ${summary.ingredientCount} ingredient(s), ${summary.nutritionEntryCount} nutrition entry(ies), ${summary.reviewEntryCount} review entry(ies), and ${summary.fidelityRecordCount} fidelity record(s).`,
  );
}

export function runContentValidationCli(root = process.cwd()): void {
  try {
    printContentValidationSuccess(validateContentData(root));
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  runContentValidationCli();
}
