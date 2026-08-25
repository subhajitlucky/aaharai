import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ChefHat, Clock, MapPin, Users } from "lucide-react";
import { getAllRecipes } from "@/lib/content/recipes";
import {
  DIETARY_FRAME_LABELS,
  SERIF_DISPLAY,
  SOURCE_TYPE_PRESENTATION,
  VERIFICATION_TIER_LABELS,
  formatMinutes,
  totalTimeMinutes,
} from "@/lib/content/recipe-presentation";
import type { Recipe } from "@/lib/content/schema";

export const metadata: Metadata = {
  title: "Verified Family Recipes - Aaharai",
  description:
    "A living archive of family and community recipes with verified regional authenticity - every dish traced to the person who taught it, the place it was cooked, and the era it belongs to.",
};

const TIER_BADGE_STYLES: Record<Recipe["verification"]["tier"], string> = {
  "family-archive": "border-turmeric bg-turmeric/20",
  "community-verified": "border-sage/50 bg-sage/15",
};

function VerificationBadge({ tier }: { tier: Recipe["verification"]["tier"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide text-charcoal ${TIER_BADGE_STYLES[tier]}`}
    >
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      {VERIFICATION_TIER_LABELS[tier]}
    </span>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const source = SOURCE_TYPE_PRESENTATION[recipe.lineage.sourceType];
  return (
    <article className="h-full">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-clay/50 hover:bg-charcoal/[0.05] hover:shadow-xl hover:shadow-charcoal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
      >
        <div className="flex items-start justify-between gap-3">
          <VerificationBadge tier={recipe.verification.tier} />
          <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-charcoal/45">
            <source.icon className="h-3.5 w-3.5" aria-hidden />
            {source.label}
          </span>
        </div>

        {/* Native script as the visual anchor */}
        <p
          className="mt-7 text-5xl leading-tight text-charcoal transition-colors duration-300 group-hover:text-clay xl:text-6xl"
          style={{ fontFamily: SERIF_DISPLAY }}
        >
          {recipe.nativeName.text}
        </p>
        <p className="mt-2 text-sm text-charcoal/55">
          {recipe.transliteration ? (
            <>
              <span className="italic" style={{ fontFamily: SERIF_DISPLAY }}>
                {recipe.transliteration}
              </span>
              <span aria-hidden> · </span>
              <span className="capitalize">{recipe.nativeName.script} script</span>
            </>
          ) : (
            <span className="capitalize">{recipe.nativeName.script} script</span>
          )}
        </p>

        <div className="mt-5 border-t border-charcoal/10 pt-4">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-charcoal">
            {recipe.title}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-charcoal/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {recipe.region.state}
              {recipe.region.community ? ` · ${recipe.region.community}` : ""}
            </span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6 text-xs text-charcoal/55">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatMinutes(totalTimeMinutes(recipe))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Serves {recipe.servings}
          </span>
          <span className="rounded-full border border-sage/40 bg-sage/10 px-2.5 py-1 text-[11px] font-medium text-charcoal">
            {DIETARY_FRAME_LABELS[recipe.dietaryFrame]}
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function RecipesIndexPage() {
  const recipes = getAllRecipes();

  return (
    <div className="pb-24">
      {/* Masthead */}
      <header className="mx-auto max-w-6xl px-6 pb-10 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
          The Aaharai Archive · Verified Regional Authenticity
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h1
            className="max-w-2xl text-4xl leading-tight text-charcoal md:text-5xl"
            style={{ fontFamily: SERIF_DISPLAY }}
          >
            Recipes that carry their own proof.
          </h1>
          <div className="hidden shrink-0 text-right sm:block">
            <p
              className="text-5xl leading-none text-clay"
              style={{ fontFamily: SERIF_DISPLAY }}
              aria-hidden
            >
              {recipes.length}
            </p>
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-charcoal/50">
              verified records
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl leading-relaxed text-charcoal/60">
          Each dish is traced to the person who taught it, the place it was
          cooked and the era it belongs to — then checked by a named verifier
          before publication. Where a lineage cannot be proven, there is no
          recipe.
        </p>
        <div aria-hidden className="mt-9">
          <div className="border-t-2 border-charcoal/70" />
          <div className="mt-1 border-t border-charcoal/20" />
        </div>
      </header>

      {recipes.length === 0 ? (
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-dashed border-charcoal/20 bg-charcoal/[0.02] px-8 py-16 text-center">
            <ChefHat className="mx-auto h-10 w-10 text-charcoal/30" aria-hidden />
            <h2
              className="mt-4 text-xl text-charcoal"
              style={{ fontFamily: SERIF_DISPLAY }}
            >
              No verified recipes yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal/55">
              The first heirloom record is still being transcribed. Check back
              soon — nothing unverified ever appears here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
