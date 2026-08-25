/**
 * Verified Regional Authenticity - recipe contract.
 * Every field exists to answer: whose recipe, from where, verified by whom.
 * Keep scripts/validate-content.mjs in sync until the toolchain shares one file
 * (Weekend 2 of the recipes plan).
 */
import { z } from "zod";

const lineageEntrySchema = z.object({
  name: z.string().min(1),
  relation: z.string().optional(),
  place: z.string().optional(),
  era: z.string().optional(),
});

export const recipeSchema = z.object({
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

export type Recipe = z.infer<typeof recipeSchema>;
