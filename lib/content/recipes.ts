/**
 * Recipe loader - the only door between content/recipes/*.mdx and the app.
 *
 * Product promise: a recipe with incomplete or malformed provenance must never
 * render. Any .mdx (except _*-prefixed templates) that fails the Verified
 * Regional Authenticity contract aborts the build with a descriptive,
 * file-by-file error - the same contract scripts/validate-content.mjs enforces.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";
import type { ZodError } from "zod";
import { recipeSchema, type Recipe } from "@/lib/content/schema";

export const RECIPES_CONTENT_DIR = join(process.cwd(), "content", "recipes");

/** A schema-validated recipe plus its prose body (frontmatter stripped). */
export type LoadedRecipe = Recipe & { body: string };

// Memoised per process: static prerendering reads the directory exactly once.
// (Restart the dev server after editing .mdx files.)
let cache: LoadedRecipe[] | null = null;

function formatZodIssues(error: ZodError): string[] {
  return error.issues.map(
    (issue) => `     - [${issue.path.join(".") || "(root)"}] ${issue.message}`
  );
}

function loadAllRecipes(): LoadedRecipe[] {
  if (cache) return cache;

  let files: string[];
  try {
    files = readdirSync(RECIPES_CONTENT_DIR).filter(
      (f) => f.endsWith(".mdx") && !f.startsWith("_")
    );
  } catch (err) {
    throw new Error(
      `[aaharai] Cannot read recipe content directory "${RECIPES_CONTENT_DIR}". ${String(err)}`
    );
  }

  const loaded: LoadedRecipe[] = [];
  const failures: string[] = [];

  for (const file of files) {
    const raw = readFileSync(join(RECIPES_CONTENT_DIR, file), "utf8");
    const parsed = matter(raw);
    const result = recipeSchema.safeParse(parsed.data);

    if (!result.success) {
      failures.push(
        ["content/recipes/" + file, ...formatZodIssues(result.error)].join("\n")
      );
      continue;
    }

    const recipe = result.data;
    const fileSlug = basename(file, ".mdx");
    if (recipe.slug !== fileSlug) {
      failures.push(
        [
          "content/recipes/" + file,
          `     - [slug] frontmatter slug "${recipe.slug}" must match filename "${fileSlug}.mdx"`,
        ].join("\n")
      );
      continue;
    }
    if (loaded.some((r) => r.slug === recipe.slug)) {
      failures.push(
        [
          "content/recipes/" + file,
          `     - [slug] duplicate slug "${recipe.slug}" - slugs become URLs and must be unique`,
        ].join("\n")
      );
      continue;
    }

    loaded.push({ ...recipe, body: parsed.content.trim() });
  }

  if (failures.length > 0) {
    throw new Error(
      [
        "",
        `[aaharai] RECIPE CONTENT REJECTED - ${failures.length} of ${files.length} file(s) failed the Verified Regional Authenticity contract.`,
        "Incomplete provenance must never ship. Fix the file(s) below and rebuild.",
        "",
        ...failures,
        "",
      ].join("\n")
    );
  }

  cache = loaded.sort((a, b) => a.title.localeCompare(b.title));
  return cache;
}

/** All verified recipes, sorted alphabetically by title. */
export function getAllRecipes(): Recipe[] {
  return loadAllRecipes();
}

/** One verified recipe by URL slug, including its prose body; undefined if absent. */
export function getRecipeBySlug(slug: string): LoadedRecipe | undefined {
  return loadAllRecipes().find((r) => r.slug === slug);
}
