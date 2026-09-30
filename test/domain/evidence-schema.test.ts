import { describe, expect, it } from "vitest";
import { reviewEvidenceEntrySchema } from "@/lib/domain/review";
import { sourceFidelityRecordSchema } from "@/lib/domain/fidelity";

const review = {
  recipeId: "recipe-shukto",
  evidenceId: "review-shukto",
  role: "Aaharai AI-assisted source audit",
  reviewedAt: "2026-09-25",
  sourceChecks: [{ sourceId: "src-usda-fdc-sr-legacy-2018", check: "Checked." }],
  adaptations: ["Quantities are normalized."],
  nutritionCalculationCheck: {
    manifestVersion: 1,
    status: "recomputed",
    checkedAt: "2026-09-25",
  },
  limitations: ["No laboratory analysis was performed."],
};

const fidelity = {
  recipeId: "recipe-shukto",
  fidelityId: "fidelity-shukto",
  sourceIds: ["src-usda-fdc-sr-legacy-2018"],
  sourceTerms: ["rice"],
  adaptations: ["The source form is retained."],
  boundary: "No source prose is reproduced.",
};

describe("review and source-fidelity evidence schemas", () => {
  it("accepts explicit accountable evidence", () => {
    expect(reviewEvidenceEntrySchema.safeParse(review).success).toBe(true);
    expect(sourceFidelityRecordSchema.safeParse(fidelity).success).toBe(true);
  });

  it("rejects human review claims and missing fidelity boundaries", () => {
    expect(
      reviewEvidenceEntrySchema.safeParse({ ...review, role: "Community expert" }).success,
    ).toBe(false);
    expect(
      sourceFidelityRecordSchema.safeParse({ ...fidelity, boundary: "" }).success,
    ).toBe(false);
  });
});
