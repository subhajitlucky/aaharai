import type { SourcedRecipe } from "@/lib/content/schema";

export const SERIF_DISPLAY =
  "Georgia, 'Iowan Old Style', 'Times New Roman', 'Noto Serif', ui-serif, serif";

export const TRUST_LABELS: Record<SourcedRecipe["trustLabel"], string> = {
  "source-cited": "Source-cited",
  "regional-heritage": "Regional heritage",
  "community-tested": "Community tested",
  "ai-created": "AI-created",
};

export const DIETARY_TAG_LABELS: Record<SourcedRecipe["dietaryTags"][number], string> = {
  satvik: "Satvik",
  jain: "Jain",
  "no-onion-garlic": "No onion & garlic",
  "non-veg": "Non-vegetarian",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "dairy-free": "Dairy-free",
  "gluten-free": "Gluten-free",
  "nut-free": "Nut-free",
};

export const SEASON_TAG_LABELS: Record<SourcedRecipe["seasonTags"][number], string> = {
  spring: "Spring",
  summer: "Summer",
  monsoon: "Monsoon",
  autumn: "Autumn",
  fall: "Fall",
  winter: "Winter",
  "year-round": "Year-round",
  "all-season": "All season",
  "pre-monsoon": "Pre-monsoon",
  "post-monsoon": "Post-monsoon",
};

export function totalTimeMinutes(recipe: SourcedRecipe): number {
  return recipe.totalTimeMinutes;
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

export function formatRegionLine(recipe: SourcedRecipe): string {
  return [recipe.region.subRegion, recipe.region.district, recipe.region.state]
    .filter(Boolean)
    .join(", ");
}

export function formatDietaryTags(recipe: SourcedRecipe): string {
  return recipe.dietaryTags.map((tag) => DIETARY_TAG_LABELS[tag]).join(" · ");
}

export function formatSeasonWindow(recipe: SourcedRecipe): string {
  const { calendar, startMonth, endMonth } = recipe.seasonWindow;
  return calendar === "cross-year"
    ? `${startMonth}–${endMonth} (cross-year)`
    : `${startMonth}–${endMonth}`;
}
