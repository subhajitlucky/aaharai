import { describe, expect, it } from "vitest";
import { getAllRecipes, plainTextBody } from "@/lib/content/recipes";

describe("sourced recipe loader", () => {
  it("reduces MDX body content to safe plain text", () => {
    const body = plainTextBody(
      "<script>alert('x')</script>\n\n# Source note\n\n<Callout>Use [the source](https://example.test).</Callout>",
    );

    expect(body).toBe("Source note\n\nUse the source.");
    expect(body).not.toContain("<script");
    expect(body).not.toContain("<Callout>");
  });

  it("loads the reviewed catalog with unique stable IDs and sorted titles", () => {
    const recipes = getAllRecipes();
    const titles = recipes.map((recipe) => recipe.title);
    const ids = recipes.map((recipe) => recipe.id);
    const slugs = recipes.map((recipe) => recipe.slug);

    expect(recipes).toHaveLength(16);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(titles).toEqual([...titles].sort());
  });
});
