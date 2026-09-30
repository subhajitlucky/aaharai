import { describe, expect, it } from "vitest";
import { recipeSchema } from "@/lib/content/schema";
import { sourcedRecipeSchema } from "@/lib/domain/recipe";
import { nutritionPanelSchema, nutritionValueSchema } from "@/lib/domain/nutrition";
import { allergenSchema } from "@/lib/domain/allergen";

const representativeRecipe = {
  id: "recipe-shukto",
  slug: "shukto",
  title: "Shukto",
  nativeName: {
    text: "শুক্তো",
    script: "bengali",
  },
  region: {
    state: "West Bengal",
    district: "Nadia",
  },
  lineage: {
    sourceType: "community-cookbook",
    entries: [{ name: "Community kitchen", place: "Nadia" }],
  },
  verification: {
    tier: "source-cited",
    verifierName: "Aaharai AI-assisted source audit",
    verifiedAt: "2026-09-25",
  },
  reviewEvidenceId: "review-shukto",
  sourceFidelityId: "fidelity-shukto",
  occasions: ["everyday"],
  ingredients: [
    { ingredientId: "ingredient-bitter-gourd", quantity: 1, unit: "piece" },
    { ingredientId: "ingredient-milk", quantity: 100, unit: "ml" },
  ],
  steps: [{ text: "Cook the vegetables and finish with milk." }],
  servings: 4,
  variations: [],
  seasonWindow: { calendar: "same-year", startMonth: 10, endMonth: 12 },
  allergenIds: ["milk"],
  nutrition: {
    servingLabel: "1 bowl",
    values: [
      {
        nutrient: "energy",
        amount: 120,
        unit: "kcal",
        sourceId: "src-nutrition-table",
        estimated: false,
      },
    ],
  },
  sourceIds: ["src-community-cookbook"],
  provenance: {
    claim: "source-cited",
  },
  trustLabel: "source-cited",
  totalTimeMinutes: 45,
  difficulty: "easy",
  substitutionIds: ["sub-milk-coconut-milk"],
  costTier: "low",
  dietaryTags: ["vegetarian"],
  seasonTags: ["winter"],
  mealCategory: "main-course",
  nutritionManifestVersion: 1,
};

const legacyRecipe = {
  slug: "legacy-recipe",
  title: "Legacy Recipe",
  nativeName: { text: "Legacy", script: "latin" },
  region: { state: "Gujarat" },
  lineage: {
    sourceType: "oral",
    entries: [{ name: "Family member" }],
  },
  verification: {
    tier: "family-archive",
    verifierName: "Reviewer",
    verifiedAt: "2026-09-25",
  },
  occasions: ["everyday"],
  dietaryFrame: "vegetarian",
  ingredients: [{ item: "Rice", qty: "1 cup" }],
  steps: [{ text: "Cook the rice." }],
  time: { prepMinutes: 5, cookMinutes: 20 },
  servings: 2,
  variations: [],
};

describe("sourced recipe schema", () => {
  it("keeps the legacy recipe contract parseable", () => {
    expect(recipeSchema.safeParse(legacyRecipe).success).toBe(true);
    expect(sourcedRecipeSchema.safeParse(representativeRecipe).success).toBe(true);
  });

  it("accepts an AI-created recipe without inherited lineage or verification", () => {
    const {
      lineage: removedLineage,
      verification: removedVerification,
      reviewEvidenceId: removedReviewEvidenceId,
      sourceFidelityId: removedSourceFidelityId,
      ...withoutInheritedMetadata
    } = representativeRecipe;

    expect(removedLineage.sourceType).toBe("community-cookbook");
    expect(removedVerification.tier).toBe("source-cited");
    expect(removedReviewEvidenceId).toBe("review-shukto");
    expect(removedSourceFidelityId).toBe("fidelity-shukto");
    expect(
      sourcedRecipeSchema.safeParse({
        ...withoutInheritedMetadata,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: { claim: "ai-created" },
      }).success,
    ).toBe(true);
  });

  it("accepts a valid regional-heritage representative", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        trustLabel: "regional-heritage",
        provenance: { claim: "regional-heritage" },
        verification: {
          tier: "community-verified",
          verifierName: "Aaharai AI-assisted source audit",
          verifiedAt: "2026-09-25",
        },
      }).success,
    ).toBe(true);
  });

  it("accepts a valid community-tested representative with evidence", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        trustLabel: "community-tested",
        provenance: { claim: "community-tested" },
        verification: {
          tier: "community-verified",
          verifierName: "Aaharai AI-assisted source audit",
          verifiedAt: "2026-09-25",
        },
        communityTestingEvidence: {
          method: "Structured recipe review",
          participants: "One recorded test cook",
          recordedAt: "2026-09-25",
          record: "test/community-record",
        },
      }).success,
    ).toBe(true);
  });

  it("rejects community-tested provenance without explicit testing evidence", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        trustLabel: "community-tested",
        provenance: { claim: "community-tested" },
        verification: {
          tier: "community-verified",
          verifierName: "Aaharai AI-assisted source audit",
          verifiedAt: "2026-09-25",
        },
      }).success,
    ).toBe(false);
  });

  it("keeps recipe source IDs in one canonical top-level list", () => {
    expect(sourcedRecipeSchema.safeParse(representativeRecipe).success).toBe(true);
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        provenance: {
          claim: "source-cited",
          sourceIds: ["src-community-cookbook"],
        },
      }).success,
    ).toBe(false);
  });

  it("requires metadata required by each non-AI trust label", () => {
    const sourceCited = {
      ...representativeRecipe,
      trustLabel: "source-cited",
      provenance: {
        claim: "source-cited",
      },
    };
    const regionalHeritage = {
      ...representativeRecipe,
      trustLabel: "regional-heritage",
      provenance: {
        claim: "regional-heritage",
      },
    };
    const communityTested = {
      ...representativeRecipe,
      trustLabel: "community-tested",
      provenance: {
        claim: "community-tested",
      },
    };

    expect(
      sourcedRecipeSchema.safeParse(
        Object.fromEntries(
          Object.entries(sourceCited).filter(([key]) => key !== "verification"),
        ),
      ).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse(
        Object.fromEntries(
          Object.entries(regionalHeritage).filter(([key]) => key !== "lineage"),
        ),
      ).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse(
        Object.fromEntries(
          Object.entries(communityTested).filter(([key]) => key !== "verification"),
        ),
      ).success,
    ).toBe(false);
  });

  it("requires ISO verification dates for sourced recipes", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        verification: {
          ...representativeRecipe.verification,
          verifiedAt: "2026-02-30",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects legacy duplicate fields on sourced recipes", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        time: { prepMinutes: 1, cookMinutes: 2 },
      }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        dietaryFrame: "vegan",
      }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        seasonalWindow: "October-December",
      }).success,
    ).toBe(false);
  });

  it("rejects AI-created verification-only metadata", () => {
    const aiRecipe = Object.fromEntries(
      Object.entries(representativeRecipe).filter(
        ([key]) => key !== "lineage" && key !== "verification",
      ),
    );

    expect(
      sourcedRecipeSchema.safeParse({
        ...aiRecipe,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: { claim: "ai-created" },
        verification: {
          tier: "family-archive",
          verifierName: "Legacy reviewer",
          verifiedAt: "2026-09-25",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects AI-created lineage-only metadata", () => {
    const aiRecipe = Object.fromEntries(
      Object.entries(representativeRecipe).filter(
        ([key]) => key !== "lineage" && key !== "verification",
      ),
    );

    expect(
      sourcedRecipeSchema.safeParse({
        ...aiRecipe,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: { claim: "ai-created" },
        lineage: {
          sourceType: "oral",
          entries: [{ name: "Legacy keeper" }],
        },
      }).success,
    ).toBe(false);
  });

  it("rejects AI-created published-reference-only metadata", () => {
    const aiRecipe = Object.fromEntries(
      Object.entries(representativeRecipe).filter(
        ([key]) => key !== "lineage" && key !== "verification",
      ),
    );

    expect(
      sourcedRecipeSchema.safeParse({
        ...aiRecipe,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: { claim: "ai-created" },
        lineage: {
          sourceType: "oral",
          entries: [{ name: "Legacy keeper" }],
          publishedRef: "Legacy publication",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects a recipe without recipe source IDs", () => {
    const { sourceIds: removedSourceIds, ...withoutSourceIds } = representativeRecipe;

    expect(removedSourceIds).toEqual(["src-community-cookbook"]);
    expect(sourcedRecipeSchema.safeParse(withoutSourceIds).success).toBe(false);
  });

  it("rejects invalid recipe IDs", () => {
    expect(
      sourcedRecipeSchema.safeParse({ ...representativeRecipe, id: "recipe_Shukto" }).success,
    ).toBe(false);
  });

  it("requires the new sourced contract fields", () => {
    const requiredFields = [
      "provenance",
      "sourceIds",
      "nutrition",
      "ingredients",
      "trustLabel",
    ] as const;

    for (const field of requiredFields) {
      const withoutField = Object.fromEntries(
        Object.entries(representativeRecipe).filter(([key]) => key !== field),
      );

      expect(sourcedRecipeSchema.safeParse(withoutField).success).toBe(false);
    }
  });

  it("rejects empty recipe source IDs", () => {
    expect(
      sourcedRecipeSchema.safeParse({ ...representativeRecipe, sourceIds: [] }).success,
    ).toBe(false);
  });

  it("rejects invalid normalized ingredient and substitution IDs", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        ingredients: [{ ingredientId: " Bitter Gourd ", quantity: 1, unit: "piece" }],
      }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        substitutionIds: ["swap-milk"],
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid numeric season month range", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        seasonWindow: { calendar: "same-year", startMonth: 12, endMonth: 2 },
      }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        seasonWindow: { calendar: "same-year", startMonth: 0, endMonth: 2 },
      }).success,
    ).toBe(false);
  });

  it("supports cross-calendar-year season windows", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        seasonWindow: { calendar: "cross-year", startMonth: 11, endMonth: 2 },
      }).success,
    ).toBe(true);
  });

  it("rejects season windows inconsistent with their calendar mode", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        seasonWindow: { calendar: "same-year", startMonth: 11, endMonth: 2 },
      }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        seasonWindow: { calendar: "cross-year", startMonth: 2, endMonth: 11 },
      }).success,
    ).toBe(false);
  });

  it("rejects unsupported trust labels", () => {
    expect(
      sourcedRecipeSchema.safeParse({ ...representativeRecipe, trustLabel: "expert-verified" }).success,
    ).toBe(false);
  });

  it("rejects AI-created recipes that claim source-cited provenance", () => {
    expect(
      sourcedRecipeSchema.safeParse({ ...representativeRecipe, trustLabel: "ai-created" }).success,
    ).toBe(false);
  });

  it("rejects AI-created recipes with nested provenance source IDs", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: {
          claim: "ai-created",
          sourceIds: ["src-community-cookbook"],
        },
      }).success,
    ).toBe(false);
  });

  it("rejects inherited community lineage or verification claims for AI-created recipes", () => {
    const aiRecipe = {
      ...representativeRecipe,
      trustLabel: "ai-created",
      sourceIds: [],
      provenance: { claim: "ai-created" },
    };

    expect(
      sourcedRecipeSchema.safeParse({
        ...aiRecipe,
        lineage: {
          sourceType: "community-cookbook",
          entries: [{ name: "Community kitchen" }],
        },
        verification: {
          tier: "family-archive",
          verifierName: "Content reviewer",
          verifiedAt: "2026-09-25",
        },
      }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({
        ...aiRecipe,
        lineage: {
          sourceType: "oral",
          entries: [{ name: "Family member" }],
        },
        verification: {
          tier: "community-verified",
          verifierName: "Content reviewer",
          verifiedAt: "2026-09-25",
        },
      }).success,
    ).toBe(false);
  });

  it.each([
    ["oral", "family-archive"],
    ["oral", "community-verified"],
    ["family-manuscript", "family-archive"],
    ["family-manuscript", "community-verified"],
    ["community-cookbook", "family-archive"],
    ["community-cookbook", "community-verified"],
  ] as const)(
    "rejects inherited %s lineage with %s verification for AI-created recipes",
    (sourceType, tier) => {
      const aiRecipe = {
        ...representativeRecipe,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: { claim: "ai-created" },
      };

      expect(
        sourcedRecipeSchema.safeParse({
          ...aiRecipe,
          lineage: {
            sourceType,
            entries: [{ name: "Legacy keeper" }],
          },
          verification: {
            tier,
            verifierName: "Legacy reviewer",
            verifiedAt: "2026-09-25",
          },
        }).success,
      ).toBe(false);
    },
  );

  it("rejects published legacy references for AI-created recipes", () => {
    expect(
      sourcedRecipeSchema.safeParse({
        ...representativeRecipe,
        trustLabel: "ai-created",
        sourceIds: [],
        provenance: { claim: "ai-created" },
        lineage: {
          sourceType: "oral",
          entries: [{ name: "Family member" }],
          publishedRef: "Legacy publication",
        },
      }).success,
    ).toBe(false);
  });

  it("rejects invalid allergen tags in a recipe", () => {
    expect(
      sourcedRecipeSchema.safeParse({ ...representativeRecipe, allergenIds: ["unlisted"] }).success,
    ).toBe(false);
    expect(
      sourcedRecipeSchema.safeParse({ ...representativeRecipe, allergenIds: [{ id: "other" }] }).success,
    ).toBe(false);
  });
});

describe("nutrition schemas", () => {
  it("accepts a sourced nutrition panel", () => {
    expect(nutritionPanelSchema.safeParse(representativeRecipe.nutrition).success).toBe(true);
  });

  it("rejects duplicate nutrition entries by canonical nutrient and unit", () => {
    const firstValue = representativeRecipe.nutrition.values[0];

    expect(
      nutritionPanelSchema.safeParse({
        ...representativeRecipe.nutrition,
        values: [
          firstValue,
          { ...firstValue, nutrient: " Energy ", amount: 130 },
        ],
      }).success,
    ).toBe(false);
  });

  it("allows the same nutrient in different units", () => {
    const firstValue = representativeRecipe.nutrition.values[0];

    expect(
      nutritionPanelSchema.safeParse({
        ...representativeRecipe.nutrition,
        values: [
          { ...firstValue, nutrient: "protein", unit: "g" },
          { ...firstValue, nutrient: "Protein", unit: "mg" },
        ],
      }).success,
    ).toBe(true);
  });

  it("requires a source ID, unit, and explicit estimate status", () => {
    const { sourceId: removedSourceId, ...withoutSource } = representativeRecipe.nutrition.values[0];
    const { unit: removedUnit, ...withoutUnit } = representativeRecipe.nutrition.values[0];
    const { estimated: removedEstimate, ...withoutEstimate } = representativeRecipe.nutrition.values[0];

    expect(removedSourceId).toBe("src-nutrition-table");
    expect(removedUnit).toBe("kcal");
    expect(removedEstimate).toBe(false);
    expect(nutritionValueSchema.safeParse(withoutSource).success).toBe(false);
    expect(nutritionValueSchema.safeParse(withoutUnit).success).toBe(false);
    expect(nutritionValueSchema.safeParse(withoutEstimate).success).toBe(false);
  });

  it("rejects negative amounts and unsupported units", () => {
    expect(
      nutritionValueSchema.safeParse({ ...representativeRecipe.nutrition.values[0], amount: -1 }).success,
    ).toBe(false);
    expect(
      nutritionValueSchema.safeParse({ ...representativeRecipe.nutrition.values[0], unit: "cup" }).success,
    ).toBe(false);
  });
});

describe("allergen schema", () => {
  it("accepts fixed normalized IDs and controlled other labels", () => {
    expect(allergenSchema.safeParse("peanut").success).toBe(true);
    expect(allergenSchema.safeParse({ id: "other", label: "horse-radish" }).success).toBe(true);
  });

  it("normalizes controlled other labels", () => {
    const result = allergenSchema.safeParse({ id: "other", label: " Horse Radish " });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "other", label: "horse-radish" });
  });

  it("rejects other labels that collide with fixed allergen IDs", () => {
    expect(allergenSchema.safeParse({ id: "other", label: "milk" }).success).toBe(false);
    expect(allergenSchema.safeParse({ id: "other", label: "tree-nuts" }).success).toBe(false);
  });

  it("rejects free text and unlabeled other allergens", () => {
    expect(allergenSchema.safeParse("not-a-known-allergen").success).toBe(false);
    expect(allergenSchema.safeParse({ id: "other", label: "not normalized!" }).success).toBe(false);
  });
});
