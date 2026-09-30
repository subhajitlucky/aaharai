import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadRecipesFromDirectory } from "@/lib/content/recipes";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createRecipeDirectory(): string {
  const directory = mkdtempSync(join(process.cwd(), "test", ".recipe-loader-"));
  temporaryDirectories.push(directory);
  return directory;
}

function productionDosa(): string {
  return readFileSync(join(process.cwd(), "content", "recipes", "south-indian-jain-dosa.mdx"), "utf8");
}

describe("recipe loader failures", () => {
  it("fails fast with the offending file when frontmatter is malformed", () => {
    const directory = createRecipeDirectory();
    writeFileSync(join(directory, "broken.mdx"), "---\nid: [not-valid\n---\n", "utf8");

    expect(() => loadRecipesFromDirectory(directory)).toThrow(
      /SOURCED RECIPE CONTENT REJECTED[\s\S]*broken\.mdx/,
    );
  });

  it("fails fast on duplicate recipe IDs", () => {
    const directory = createRecipeDirectory();
    const source = productionDosa();
    writeFileSync(join(directory, "first.mdx"), source.replace("slug: south-indian-jain-dosa", "slug: first"), "utf8");
    writeFileSync(join(directory, "second.mdx"), source.replace("slug: south-indian-jain-dosa", "slug: second"), "utf8");

    expect(() => loadRecipesFromDirectory(directory)).toThrow(
      /duplicate recipe ID "recipe-south-indian-jain-dosa"/,
    );
  });

  it("fails fast when a filename does not match the frontmatter slug", () => {
    const directory = createRecipeDirectory();
    writeFileSync(join(directory, "wrong-name.mdx"), productionDosa(), "utf8");

    expect(() => loadRecipesFromDirectory(directory)).toThrow(
      /frontmatter slug "south-indian-jain-dosa" must match filename "wrong-name\.mdx"/,
    );
  });
});
