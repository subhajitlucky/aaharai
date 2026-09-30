import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";
import type { ZodError } from "zod";
import { sourcedRecipeSchema, type SourcedRecipe } from "@/lib/content/schema";
import { loadContentRegistries } from "@/lib/content/registries";
import { validateContentReferences } from "@/lib/content/reference-validation";

export const RECIPES_CONTENT_DIR = join(process.cwd(), "content", "recipes");

export type LoadedRecipe = SourcedRecipe & { body: string };

type RecipeCache = {
  root: string;
  recipes: LoadedRecipe[];
};

let cache: RecipeCache | null = null;

export function recipeFilenameMatchesSlug(filename: string, slug: string): boolean {
  return basename(filename, ".mdx") === slug;
}

export function plainTextBody(content: string): string {
  return content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function formatZodIssues(error: ZodError): string[] {
  return error.issues.map(
    (issue) => `     - [${issue.path.join(".") || "(root)"}] ${issue.message}`,
  );
}

export function loadRecipesFromDirectory(directory: string): LoadedRecipe[] {
  let files: string[];
  try {
    files = readdirSync(directory)
      .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
      .sort();
  } catch (error) {
    throw new Error(
      `[aaharai] Cannot read recipe content directory "${directory}". ${String(error)}`,
    );
  }

  const loaded: LoadedRecipe[] = [];
  const failures: string[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const file of files) {
    const raw = readFileSync(join(directory, file), "utf8");
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch (error) {
      failures.push(
        [
          "content/recipes/" + file,
          `     - [frontmatter] ${String(error)}`,
        ].join("\n"),
      );
      continue;
    }
    const result = sourcedRecipeSchema.safeParse(parsed.data);

    if (!result.success) {
      failures.push(
        ["content/recipes/" + file, ...formatZodIssues(result.error)].join("\n"),
      );
      continue;
    }

    const recipe = result.data;
    const fileSlug = basename(file, ".mdx");
    if (!recipeFilenameMatchesSlug(file, recipe.slug)) {
      failures.push(
        [
          "content/recipes/" + file,
          `     - [slug] frontmatter slug "${recipe.slug}" must match filename "${fileSlug}.mdx"`,
        ].join("\n"),
      );
      continue;
    }
    if (seenIds.has(recipe.id)) {
      failures.push(
        [
          "content/recipes/" + file,
          `     - [id] duplicate recipe ID "${recipe.id}" - IDs must be unique`,
        ].join("\n"),
      );
      continue;
    }
    if (seenSlugs.has(recipe.slug)) {
      failures.push(
        [
          "content/recipes/" + file,
          `     - [slug] duplicate slug "${recipe.slug}" - slugs become URLs and must be unique`,
        ].join("\n"),
      );
      continue;
    }

    seenIds.add(recipe.id);
    seenSlugs.add(recipe.slug);
    loaded.push({ ...recipe, body: plainTextBody(parsed.content) });
  }

  if (failures.length > 0) {
    throw new Error(
      [
        "",
        `[aaharai] SOURCED RECIPE CONTENT REJECTED - ${failures.length} of ${files.length} file(s) failed the sourced recipe contract.`,
        "Fix the file(s) below and rebuild.",
        "",
        ...failures,
        "",
      ].join("\n"),
    );
  }

  return loaded.sort(
    (left, right) =>
      compareText(left.title, right.title) || compareText(left.slug, right.slug),
  );
}

function getLoadedRecipes(root: string): LoadedRecipe[] {
  if (cache?.root === root) return cache.recipes;
  const recipes = loadRecipesFromDirectory(join(root, "content", "recipes"));
  const registries = loadContentRegistries(root);
  const issues = validateContentReferences({ ...registries, recipes });
  if (issues.length > 0) {
    throw new Error(
      [
        "",
        `[aaharai] CONTENT REFERENCE VALIDATION FAILED - ${issues.length} issue(s).`,
        ...issues.map((message) => `     - ${message}`),
        "",
      ].join("\n"),
    );
  }
  cache = { root, recipes };
  return recipes;
}

export function clearRecipeCache(): void {
  cache = null;
}

export function getAllRecipes(root = process.cwd()): SourcedRecipe[] {
  return getLoadedRecipes(root);
}

export function getRecipeBySlug(slug: string, root = process.cwd()): LoadedRecipe | undefined {
  return getLoadedRecipes(root).find((recipe) => recipe.slug === slug);
}
