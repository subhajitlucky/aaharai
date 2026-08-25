/**
 * Presentation mappings shared by the recipes index and detail pages.
 * Keeps human-facing labels for the enum values in the content contract
 * in ONE place so UI and future surfaces cannot drift apart.
 */
import {
  BookOpen,
  MessagesSquare,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { Recipe } from "@/lib/content/schema";

type SourceType = Recipe["lineage"]["sourceType"];
type VerificationTier = Recipe["verification"]["tier"];
type DietaryFrame = Recipe["dietaryFrame"];

/** Editorial serif stack - the project ships no serif webfont; system serifs
 *  give the archive its print feel without adding a build-time dependency. */
export const SERIF_DISPLAY =
  "Georgia, 'Iowan Old Style', 'Times New Roman', 'Noto Serif', ui-serif, serif";

export const SOURCE_TYPE_PRESENTATION: Record<
  SourceType,
  { label: string; icon: LucideIcon }
> = {
  oral: { label: "Oral tradition", icon: MessagesSquare },
  "family-manuscript": { label: "Family manuscript", icon: ScrollText },
  "community-cookbook": { label: "Community cookbook", icon: BookOpen },
};

export const VERIFICATION_TIER_LABELS: Record<VerificationTier, string> = {
  "family-archive": "Family Archive",
  "community-verified": "Community Verified",
};

export const DIETARY_FRAME_LABELS: Record<DietaryFrame, string> = {
  satvik: "Satvik",
  jain: "Jain",
  "no-onion-garlic": "No Onion & Garlic",
  "non-veg": "Non-Veg",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
};

export function totalTimeMinutes(recipe: Recipe): number {
  return recipe.time.prepMinutes + recipe.time.cookMinutes;
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

/** "District, State" - sub-region when present, always anchored by state. */
export function formatRegionLine(recipe: Recipe): string {
  return [recipe.region.subRegion, recipe.region.state]
    .filter(Boolean)
    .join(", ");
}
