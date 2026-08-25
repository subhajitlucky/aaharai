// Content validator - machine-enforces the Verified Regional Authenticity contract.
// Schema is intentionally mirrored from lib/content/schema.ts (see sync note there).
import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const lineageEntrySchema = z.object({
  name: z.string().min(1),
  relation: z.string().optional(),
  place: z.string().optional(),
  era: z.string().optional(),
});

const recipeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug: lowercase kebab-case only"),
  title: z.string().min(1),
  nativeName: z.object({
    text: z.string().min(1),
    script: z.string().min(1),
  }),
  transliteration: z.string().optional(),
  dialectVariant: z.string().optional(),
  region: z.object({
    state: z.string().min(1),
    subRegion: z.string().optional(),
    community: z.string().optional(),
  }),
  languageNote: z.string().optional(),
  lineage: z.object({
    sourceType: z.enum(["oral", "family-manuscript", "community-cookbook"]),
    entries: z.array(lineageEntrySchema).min(1),
    publishedRef: z.string().optional(),
  }),
  verification: z.object({
    tier: z.enum(["family-archive", "community-verified"]),
    verifierName: z.string().min(1),
    verifiedAt: z.string(),
  }),
  occasions: z.array(z.string()).min(1),
  seasonalWindow: z.string().optional(),
  dietaryFrame: z.enum(["satvik", "jain", "no-onion-garlic", "non-veg", "vegan", "vegetarian"]),
  ingredients: z.array(
    z.object({
      item: z.string().min(1),
      qty: z.string().min(1),
      note: z.string().optional(),
      nativeTerm: z.string().optional(),
    })
  ).min(1),
  steps: z.array(
    z.object({
      text: z.string().min(1),
      tip: z.string().optional(),
      technique: z.string().optional(),
    })
  ).min(1),
  time: z.object({
    prepMinutes: z.number().int().positive(),
    cookMinutes: z.number().int().positive(),
  }),
  servings: z.number().int().positive(),
  variations: z.array(
    z.object({
      label: z.string().min(1),
      note: z.string(),
    })
  ),
  authenticityNotes: z.string().optional(),
  heroImage: z.string().optional(),
});

const dir = join(process.cwd(), "content", "recipes");
const files = readdirSync(dir).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));

if (files.length === 0) {
  console.log("No recipe files found (only templates). Nothing to validate.");
  process.exit(0);
}

let failed = 0;
const seenSlugs = new Set();
for (const file of files) {
  const path = join(dir, file);
  const parsed = matter(readFileSync(path, "utf8"));
  const result = recipeSchema.safeParse(parsed.data);
  if (!result.success) {
    failed++;
    console.log("FAIL " + file);
    for (const issue of result.error.issues) {
      console.log("     - [" + issue.path.join(".") + "] " + issue.message);
    }
    continue;
  }
  const slug = result.data.slug;
  if (seenSlugs.has(slug)) {
    failed++;
    console.log("FAIL " + file + " - duplicate slug: " + slug);
    continue;
  }
  seenSlugs.add(slug);
  console.log("OK   " + file + "  (" + result.data.title + ")");
}

console.log("");
console.log(files.length + " file(s) checked, " + failed + " failed.");
process.exit(failed > 0 ? 1 : 0);
