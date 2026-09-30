import { z } from "zod";

export const fixedAllergenIds = [
  "celery",
  "crustaceans",
  "egg",
  "fish",
  "gluten",
  "lupin",
  "milk",
  "molluscs",
  "mustard",
  "peanut",
  "sesame",
  "soy",
  "sulphites",
  "tree-nuts",
  "wheat",
] as const;

export const allergenIdSchema = z.enum(fixedAllergenIds);

const fixedAllergenIdSet = new Set<string>(fixedAllergenIds);

export const normalizedAllergenLabelSchema = z
  .string()
  .transform((label) => label.trim().toLowerCase().replace(/[\s_]+/g, "-"))
  .refine((label) => label.length >= 1 && label.length <= 80, "allergen label: use 1-80 characters")
  .refine(
    (label) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label),
    "allergen label: use normalized kebab-case"
  )
  .refine(
    (label) => !fixedAllergenIdSet.has(label),
    "other allergen label must not collide with a fixed allergen ID"
  );

export const otherAllergenSchema = z.object({
  id: z.literal("other"),
  label: normalizedAllergenLabelSchema,
});

export const allergenSchema = z.union([allergenIdSchema, otherAllergenSchema]);

export const allergenIdsSchema = z.array(allergenSchema);

export type AllergenId = z.infer<typeof allergenIdSchema>;
export type OtherAllergen = z.infer<typeof otherAllergenSchema>;
export type Allergen = z.infer<typeof allergenSchema>;
