import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const outputDirectories: string[] = [];

afterEach(() => {
  vi.doUnmock("@/lib/content/recipes");
  vi.resetModules();
  for (const directory of outputDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createOutputPath(): string {
  const directory = mkdtempSync(join(process.cwd(), "test", ".catalog-"));
  outputDirectories.push(directory);
  return join(directory, "nested", "catalog.json");
}

describe("recipe catalog", () => {
  it("sorts deterministically and writes byte-identical fresh outputs", async () => {
    vi.doMock("@/lib/content/recipes", async () => {
      const actual = await vi.importActual<
        typeof import("@/lib/content/recipes")
      >("@/lib/content/recipes");
      const [recipe] = actual.getAllRecipes();
      if (!recipe) throw new Error("Catalog test requires one recipe fixture");

      return {
        ...actual,
        getAllRecipes: () => [
          { ...recipe, slug: "zulu", title: "Same title" },
          { ...recipe, slug: "alpha", title: "Same title" },
          { ...recipe, slug: "omega", title: "Another title" },
        ],
      };
    });

    const { generateCatalog } = await import("../scripts/generate-catalog");
    const firstOutput = readFileSync(generateCatalog(createOutputPath()), "utf8");
    const secondOutput = readFileSync(generateCatalog(createOutputPath()), "utf8");
    const catalog = JSON.parse(firstOutput) as {
      recipeCount: number;
      recipes: Array<{ slug: string }>;
    };

    expect(secondOutput).toBe(firstOutput);
    expect(firstOutput.endsWith("\n")).toBe(true);
    expect(catalog.recipeCount).toBe(3);
    expect(catalog.recipes.map((recipe) => recipe.slug)).toEqual([
      "omega",
      "alpha",
      "zulu",
    ]);
  });
});
