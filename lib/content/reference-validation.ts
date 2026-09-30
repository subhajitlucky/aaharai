import type { SourcedRecipe } from "@/lib/content/schema";
import type { NutritionManifest } from "@/lib/content/nutrition-manifest";
import type { SourceFidelityManifest } from "@/lib/domain/fidelity";
import type { IngredientCatalog } from "@/lib/domain/ingredient";
import type { ReviewEvidenceManifest } from "@/lib/domain/review";
import type { SourceCatalog } from "@/lib/domain/source";

export type ContentReferenceInput = {
  sources: SourceCatalog;
  ingredients: IngredientCatalog;
  recipes: SourcedRecipe[];
  nutritionManifest: NutritionManifest;
  reviewEvidence: ReviewEvidenceManifest;
  sourceFidelity: SourceFidelityManifest;
};

type NutrientKey = `${string}:${string}`;

function nutrientKey(nutrient: string, unit: string): NutrientKey {
  return `${nutrient}:${unit}`;
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function issue(path: string, message: string): string {
  return `[${path}] ${message}`;
}

function validateCatalogReferences(input: ContentReferenceInput): string[] {
  const issues: string[] = [];
  const sourceIds = new Set(input.sources.sources.map((source) => source.id));
  const ingredients = new Map(input.ingredients.ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const substitutions = new Map(
    input.ingredients.substitutions.map((substitution) => [substitution.id, substitution]),
  );

  for (const [index, source] of input.sources.sources.entries()) {
    if (input.sources.sources.findIndex((candidate) => candidate.id === source.id) !== index) {
      issues.push(issue("sources", `duplicate source ID "${source.id}"`));
    }
    if (source.reviewedBy !== "Aaharai AI-assisted source audit") {
      issues.push(issue(`sources.${source.id}`, "reviewer role is not the accountable source-audit role"));
    }
    if (source.reviewedAt !== "2026-09-25") {
      issues.push(issue(`sources.${source.id}`, "review date is not the fixed audit date"));
    }
  }

  for (const [index, ingredient] of input.ingredients.ingredients.entries()) {
    if (input.ingredients.ingredients.findIndex((candidate) => candidate.id === ingredient.id) !== index) {
      issues.push(issue("ingredients", `duplicate ingredient ID "${ingredient.id}"`));
    }
    for (const sourceId of ingredient.nutritionSourceIds) {
      if (!sourceIds.has(sourceId)) {
        issues.push(issue(`ingredients.${ingredient.id}`, `missing nutrition source "${sourceId}"`));
      }
    }
    for (const substitutionId of ingredient.substitutionIds) {
      const substitution = substitutions.get(substitutionId);
      if (!substitution) {
        issues.push(issue(`ingredients.${ingredient.id}`, `missing substitution "${substitutionId}"`));
      } else if (substitution.fromIngredientId !== ingredient.id) {
        issues.push(
          issue(
            `ingredients.${ingredient.id}`,
            `substitution "${substitutionId}" is not outgoing from this ingredient`,
          ),
        );
      }
    }
  }

  for (const [index, substitution] of input.ingredients.substitutions.entries()) {
    if (input.ingredients.substitutions.findIndex((candidate) => candidate.id === substitution.id) !== index) {
      issues.push(issue("substitutions", `duplicate substitution ID "${substitution.id}"`));
    }
    const source = ingredients.get(substitution.fromIngredientId);
    if (!source) {
      issues.push(issue(`substitutions.${substitution.id}`, "source ingredient does not exist"));
    }
    for (const targetId of substitution.toIngredientIds) {
      const target = ingredients.get(targetId);
      if (!target) {
        issues.push(issue(`substitutions.${substitution.id}`, `target ingredient "${targetId}" does not exist`));
      } else if (source?.baseIngredient === true && target.baseIngredient === true) {
        issues.push(
          issue(
            `substitutions.${substitution.id}`,
            `source and target "${targetId}" are both base ingredients`,
          ),
        );
      }
      const reverse = input.ingredients.substitutions.find(
        (candidate) =>
          candidate.id !== substitution.id &&
          candidate.fromIngredientId === targetId &&
          candidate.toIngredientIds.includes(substitution.fromIngredientId),
      );
      if (reverse) {
        issues.push(issue(`substitutions.${substitution.id}`, `reverse substitution "${reverse.id}" is not allowed`));
      }
    }
  }

  for (const ingredient of input.ingredients.ingredients) {
    const outgoing = input.ingredients.substitutions
      .filter((substitution) => substitution.fromIngredientId === ingredient.id)
      .map((substitution) => substitution.id)
      .sort();
    const declared = [...ingredient.substitutionIds].sort();
    if (JSON.stringify(outgoing) !== JSON.stringify(declared)) {
      issues.push(issue(`ingredients.${ingredient.id}`, "substitutionIds must exactly match outgoing substitutions"));
    }
  }

  return issues;
}

function validateRecipeReferences(input: ContentReferenceInput): string[] {
  const issues: string[] = [];
  const sourceIds = new Set(input.sources.sources.map((source) => source.id));
  const ingredientIds = new Set(input.ingredients.ingredients.map((ingredient) => ingredient.id));
  const substitutions = new Map(
    input.ingredients.substitutions.map((substitution) => [substitution.id, substitution]),
  );
  const reviewByRecipe = new Map(input.reviewEvidence.entries.map((entry) => [entry.recipeId, entry]));
  const fidelityByRecipe = new Map(input.sourceFidelity.records.map((record) => [record.recipeId, record]));
  const manifestByRecipe = new Map(input.nutritionManifest.entries.map((entry) => [entry.recipeId, entry]));

  for (const [index, entry] of input.nutritionManifest.entries.entries()) {
    if (input.nutritionManifest.entries.findIndex((candidate) => candidate.recipeId === entry.recipeId) !== index) {
      issues.push(issue("nutritionManifest", `duplicate recipe ID "${entry.recipeId}"`));
    }
  }
  for (const [index, entry] of input.reviewEvidence.entries.entries()) {
    if (input.reviewEvidence.entries.findIndex((candidate) => candidate.recipeId === entry.recipeId) !== index) {
      issues.push(issue("reviewEvidence", `duplicate recipe ID "${entry.recipeId}"`));
    }
  }
  for (const [index, record] of input.sourceFidelity.records.entries()) {
    if (input.sourceFidelity.records.findIndex((candidate) => candidate.recipeId === record.recipeId) !== index) {
      issues.push(issue("sourceFidelity", `duplicate recipe ID "${record.recipeId}"`));
    }
  }

  const recipeIds = new Set<string>();
  const recipeSlugs = new Set<string>();
  for (const recipe of input.recipes) {
    const path = `recipes.${recipe.id}`;
    if (recipeIds.has(recipe.id)) issues.push(issue(path, `duplicate recipe ID "${recipe.id}"`));
    if (recipeSlugs.has(recipe.slug)) issues.push(issue(path, `duplicate recipe slug "${recipe.slug}"`));
    recipeIds.add(recipe.id);
    recipeSlugs.add(recipe.slug);

    for (const sourceId of recipe.sourceIds) {
      if (!sourceIds.has(sourceId)) issues.push(issue(path, `missing source "${sourceId}"`));
    }
    const recipeIngredientIds = new Set<string>();
    for (const ingredient of recipe.ingredients) {
      recipeIngredientIds.add(ingredient.ingredientId);
      if (!ingredientIds.has(ingredient.ingredientId)) {
        issues.push(issue(path, `missing ingredient "${ingredient.ingredientId}"`));
      }
    }
    for (const substitutionId of recipe.substitutionIds) {
      const substitution = substitutions.get(substitutionId);
      if (!substitution) {
        issues.push(issue(path, `missing substitution "${substitutionId}"`));
      } else if (!recipeIngredientIds.has(substitution.fromIngredientId)) {
        issues.push(
          issue(path, `substitution "${substitutionId}" source is not an ingredient in the recipe`),
        );
      }
    }
    for (const nutritionValue of recipe.nutrition.values) {
      if (!sourceIds.has(nutritionValue.sourceId)) {
        issues.push(issue(path, `missing nutrition source "${nutritionValue.sourceId}"`));
      }
      if (!recipe.sourceIds.includes(nutritionValue.sourceId)) {
        issues.push(issue(path, `nutrition source "${nutritionValue.sourceId}" is not in sourceIds`));
      }
    }

    if (recipe.trustLabel !== "ai-created") {
      const review = reviewByRecipe.get(recipe.id);
      if (!review) {
        issues.push(issue(path, "missing review evidence"));
      } else {
        if (review.evidenceId !== recipe.reviewEvidenceId) {
          issues.push(issue(path, "review evidence ID does not match the recipe"));
        }
        if (review.role !== "Aaharai AI-assisted source audit") {
          issues.push(issue(path, "review evidence uses an unsupported role"));
        }
        if (review.reviewedAt !== "2026-09-25") {
          issues.push(issue(path, "review evidence date is not the fixed audit date"));
        }
        for (const sourceId of recipe.sourceIds) {
          if (!review.sourceChecks.some((check) => check.sourceId === sourceId)) {
            issues.push(issue(path, `review evidence does not check source "${sourceId}"`));
          }
        }
        if (review.nutritionCalculationCheck.manifestVersion !== recipe.nutritionManifestVersion) {
          issues.push(issue(path, "review evidence points to a different nutrition manifest"));
        }
      }

      const fidelity = fidelityByRecipe.get(recipe.id);
      if (!fidelity) {
        issues.push(issue(path, "missing source-fidelity record"));
      } else {
        if (fidelity.fidelityId !== recipe.sourceFidelityId) {
          issues.push(issue(path, "source-fidelity ID does not match the recipe"));
        }
        for (const sourceId of recipe.sourceIds) {
          if (!fidelity.sourceIds.includes(sourceId)) {
            issues.push(issue(path, `source-fidelity record omits source "${sourceId}"`));
          }
        }
        if (recipe.id === "recipe-odisha-nadia-pura-idli") {
          const adaptations = fidelity.adaptations.join(" ");
          if (
            !fidelity.sourceTerms.includes("sugar") ||
            !fidelity.sourceTerms.includes("brown sugar") ||
            fidelity.sourceTerms.includes("jaggery") ||
            !/jaggery[\s\S]*(adapt|replacement)|source (?:sugar|brown sugar)[\s\S]*jaggery/i.test(adaptations)
          ) {
            issues.push(issue(path, "Nadia Pura Idli fidelity must record the jaggery adaptation from source sugar forms"));
          }
        }
        if (recipe.id === "recipe-punjab-chicken-biryani") {
          for (const term of ["biryani masala", "black cardamom", "garam masala", "green cardamom"]) {
            if (!fidelity.sourceTerms.includes(term)) {
              issues.push(issue(path, `biryani fidelity must record "${term}"`));
            }
          }
          const adaptations = fidelity.adaptations.join(" ");
          if (!/biryani masala[\s\S]*black cardamom|black cardamom[\s\S]*biryani masala/i.test(adaptations)) {
            issues.push(issue(path, "biryani fidelity must record the biryani masala and black cardamom deviations"));
          }
        }
      }
    }

    if (recipe.trustLabel === "community-tested" && !("communityTestingEvidence" in recipe)) {
      issues.push(issue(path, "community-tested recipe has no explicit testing evidence"));
    }

    const manifestEntry = manifestByRecipe.get(recipe.id);
    if (!manifestEntry) {
      issues.push(issue(path, "missing nutrition manifest entry"));
      continue;
    }
    if (recipe.id === "recipe-odisha-nadia-pura-idli") {
      const jaggery = manifestEntry.ingredients.find(
        (ingredient) => ingredient.ingredientId === "ingredient-jaggery",
      );
      if (
        !jaggery ||
        jaggery.includedInNutrition !== true ||
        jaggery.sourceFoodId !== 169655 ||
        !/jaggery[\s\S]*sugar|source sugar[\s\S]*jaggery/i.test(jaggery.adaptation ?? "")
      ) {
        issues.push(issue(path, "Nadia Pura Idli manifest must record jaggery as a sugar-proxy adaptation"));
      }
    }
    if (recipe.id === "recipe-tamil-pongal") {
      const coconut = manifestEntry.ingredients.find(
        (ingredient) => ingredient.ingredientId === "ingredient-desiccated-coconut",
      );
      if (
        !coconut ||
        coconut.includedInNutrition !== true ||
        coconut.sourceFoodId !== 170170 ||
        !/dried.*desiccated/i.test(coconut.sourceFoodDescription)
      ) {
        issues.push(issue(path, "Pongal manifest must use the USDA desiccated coconut record"));
      }
    }
    if (recipe.id === "recipe-punjab-chicken-biryani") {
      const masala = manifestEntry.ingredients.find(
        (ingredient) => ingredient.ingredientId === "ingredient-garam-masala",
      );
      if (
        !masala ||
        masala.includedInNutrition !== false ||
        !/biryani masala|black cardamom/i.test(masala.exclusionReason)
      ) {
        issues.push(issue(path, "Biryani manifest must record the source seasoning deviation"));
      }
    }
    if (manifestEntry.servingCount !== recipe.servings) {
      issues.push(issue(path, "nutrition manifest serving count does not match recipe servings"));
    }
    if (manifestEntry.ingredients.length !== recipe.ingredients.length) {
      issues.push(issue(path, "nutrition manifest ingredient count does not match recipe"));
    } else {
      for (const [index, ingredient] of recipe.ingredients.entries()) {
        const manifestIngredient = manifestEntry.ingredients[index];
        const catalogIngredient = input.ingredients.ingredients.find(
          (candidate) => candidate.id === ingredient.ingredientId,
        );
        if (
          manifestIngredient.ingredientId !== ingredient.ingredientId ||
          manifestIngredient.quantity !== ingredient.quantity ||
          manifestIngredient.unit !== ingredient.unit ||
          manifestIngredient.form !== catalogIngredient?.form
        ) {
          issues.push(issue(path, `nutrition manifest ingredient ${index} does not match recipe form or quantity`));
        }
      }
    }

    const calculated = new Map<NutrientKey, number>();
    for (const manifestIngredient of manifestEntry.ingredients) {
      if (!manifestIngredient.includedInNutrition) continue;
      if (manifestIngredient.unit !== "g" && manifestIngredient.unit !== "ml") {
        issues.push(issue(path, `included nutrition ingredient "${manifestIngredient.ingredientId}" must use g or ml`));
        continue;
      }
      const sourceValues = new Map(
        manifestIngredient.sourceValues.map((value) => [nutrientKey(value.nutrient, value.unit), value.amount]),
      );
      const contributionKeys = new Set<string>();
      for (const contribution of manifestIngredient.contribution) {
        const contributionKey = nutrientKey(contribution.nutrient, contribution.unit);
        if (contributionKeys.has(contributionKey)) {
          issues.push(issue(path, `manifest ingredient "${manifestIngredient.ingredientId}" has duplicate contribution ${contribution.nutrient}`));
        }
        contributionKeys.add(contributionKey);
      }
      for (const sourceKey of sourceValues.keys()) {
        if (!contributionKeys.has(sourceKey)) {
          issues.push(issue(path, `manifest ingredient "${manifestIngredient.ingredientId}" omits a contribution for ${sourceKey.split(":")[0]}`));
        }
      }
      for (const contribution of manifestIngredient.contribution) {
        const key = nutrientKey(contribution.nutrient, contribution.unit);
        const sourceAmount = sourceValues.get(key);
        if (sourceAmount === undefined) {
          issues.push(issue(path, `manifest contribution ${contribution.nutrient} has no source value`));
          continue;
        }
        const expected = rounded((sourceAmount * manifestIngredient.quantity) / 100);
        if (rounded(contribution.amount) !== expected) {
          issues.push(issue(path, `manifest contribution ${contribution.nutrient} is not recomputed`));
        }
        calculated.set(key, (calculated.get(key) ?? 0) + contribution.amount);
      }
    }

    for (const total of manifestEntry.totals) {
      const key = nutrientKey(total.nutrient, total.unit);
      const expected = rounded((calculated.get(key) ?? 0) / manifestEntry.servingCount);
      if (rounded(total.amount) !== expected) {
        issues.push(issue(path, `manifest total ${total.nutrient} is not recomputed`));
      }
      const panelValue = recipe.nutrition.values.find(
        (value) => value.nutrient === total.nutrient && value.unit === total.unit,
      );
      if (!panelValue || rounded(panelValue.amount) !== rounded(total.amount)) {
        issues.push(issue(path, `nutrition panel ${total.nutrient} does not match manifest total`));
      }
    }
  }

  for (const entry of input.nutritionManifest.entries) {
    if (!recipeIds.has(entry.recipeId)) {
      issues.push(issue("nutritionManifest", `entry references missing recipe "${entry.recipeId}"`));
    }
  }
  for (const entry of input.reviewEvidence.entries) {
    if (!recipeIds.has(entry.recipeId)) {
      issues.push(issue("reviewEvidence", `entry references missing recipe "${entry.recipeId}"`));
    }
  }
  for (const record of input.sourceFidelity.records) {
    if (!recipeIds.has(record.recipeId)) {
      issues.push(issue("sourceFidelity", `record references missing recipe "${record.recipeId}"`));
    }
  }

  return issues;
}

export function validateContentReferences(input: ContentReferenceInput): string[] {
  if (!sourceIdsAreValid(input)) {
    return ["[nutritionManifest] manifest source is not registered"];
  }
  return [...validateCatalogReferences(input), ...validateRecipeReferences(input)];
}

function sourceIdsAreValid(input: ContentReferenceInput): boolean {
  return input.sources.sources.some((source) => source.id === input.nutritionManifest.sourceId);
}
