import { describe, expect, it } from "vitest";
import { recipeFilenameMatchesSlug } from "@/lib/content/recipes";

describe("recipe filename contract", () => {
  it("matches a frontmatter slug to its mdx filename", () => {
    expect(recipeFilenameMatchesSlug("shukto.mdx", "shukto")).toBe(true);
    expect(recipeFilenameMatchesSlug("content/recipes/shukto.mdx", "shukto")).toBe(true);
  });

  it("rejects a frontmatter slug that differs from its mdx filename", () => {
    expect(recipeFilenameMatchesSlug("shukto.mdx", "other-shukto")).toBe(false);
    expect(recipeFilenameMatchesSlug("content/recipes/shukto.mdx", "shukto-demo")).toBe(false);
  });
});
