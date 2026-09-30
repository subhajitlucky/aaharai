import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ChefHat, Clock, MapPin, Users } from "lucide-react";
import { getAllRecipes } from "@/lib/content/recipes";
import {
  DIETARY_TAG_LABELS,
  SERIF_DISPLAY,
  TRUST_LABELS,
  formatMinutes,
  totalTimeMinutes,
} from "@/lib/content/recipe-presentation";
import type { SourcedRecipe } from "@/lib/content/schema";

export const metadata: Metadata = {
  title: "Source-cited Recipes",
  description:
    "Regional Indian recipes with explicit source records, normalized ingredients, and clearly marked nutrition estimates.",
};

const TRUST_BADGE_STYLES: Record<SourcedRecipe["trustLabel"], string> = {
  "source-cited": "border-clay/50 bg-clay/10",
  "regional-heritage": "border-turmeric bg-turmeric/20",
  "community-tested": "border-sage/50 bg-sage/15",
  "ai-created": "border-charcoal/20 bg-charcoal/[0.05]",
};

function TrustBadge({ trustLabel }: { trustLabel: SourcedRecipe["trustLabel"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide text-charcoal ${TRUST_BADGE_STYLES[trustLabel]}`}
    >
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      {TRUST_LABELS[trustLabel]}
    </span>
  );
}

function RecipeCard({ recipe }: { recipe: SourcedRecipe }) {
  return (
    <article className="h-full">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-clay/50 hover:bg-charcoal/[0.05] hover:shadow-xl hover:shadow-charcoal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
      >
        <div className="flex items-start justify-between gap-3">
          <TrustBadge trustLabel={recipe.trustLabel} />
          <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-charcoal/80">
            Source record
          </span>
        </div>

        <p
          className="mt-7 text-5xl leading-tight text-charcoal transition-colors duration-300 group-hover:text-clay xl:text-6xl"
          style={{ fontFamily: SERIF_DISPLAY }}
        >
          {recipe.nativeName.text}
        </p>
        <p className="mt-2 text-sm text-charcoal/80">
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
          <p className="mt-2 flex items-center gap-1.5 text-sm text-charcoal/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {recipe.region.state}
              {recipe.region.community ? ` · ${recipe.region.community}` : ""}
            </span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6 text-xs text-charcoal/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatMinutes(totalTimeMinutes(recipe))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Serves {recipe.servings}
          </span>
          <span className="rounded-full border border-sage/40 bg-sage/10 px-2.5 py-1 text-[11px] font-medium text-charcoal">
            {DIETARY_TAG_LABELS[recipe.dietaryTags[0]]}
          </span>
        </div>
      </Link>
    </article>
  );
}

export function RecipesIndexContent({ recipes }: { recipes: SourcedRecipe[] }) {
  return (
    <div className="pb-24">
      <header className="mx-auto max-w-6xl px-6 pb-10 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
          The Aaharai Archive · Source-cited records
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
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-charcoal/80">
              source-cited records
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl leading-relaxed text-charcoal/80">
          Each public recipe names its source record, ingredient form, adaptation boundary, and nutrition source. A source-cited label is not a claim of community testing or laboratory measurement.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sources"
            className="inline-flex items-center gap-2 rounded-full border border-clay/50 bg-clay/10 px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-clay/20"
          >
            How these records are sourced
          </Link>
          <Link
            href="/seasonal"
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white/40 px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:border-clay/50"
          >
            Seasonal calendar
          </Link>
        </div>
        <div aria-hidden className="mt-9">
          <div className="border-t-2 border-charcoal/70" />
          <div className="mt-1 border-t border-charcoal/20" />
        </div>
      </header>

      {recipes.length === 0 ? (
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-dashed border-charcoal/20 bg-charcoal/[0.02] px-8 py-16 text-center">
            <ChefHat className="mx-auto h-10 w-10 text-charcoal/80" aria-hidden />
            <h2
              className="mt-4 text-xl text-charcoal"
              style={{ fontFamily: SERIF_DISPLAY }}
            >
              No verified recipes yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal/80">
              The first source-cited record is still being transcribed. Check back soon — nothing unverified ever appears here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
      <Coverage recipes={recipes} />
    </div>
  );
}

/**
 * Regional coverage, computed from the records themselves. The gaps are shown
 * as plainly as the coverage: an atlas that only displays what it has is not
 * an accurate picture of the country's food.
 */
function Coverage({ recipes }: { recipes: SourcedRecipe[] }) {
  const byState = new Map<string, number>();
  for (const recipe of recipes) {
    const state = recipe.region.state;
    byState.set(state, (byState.get(state) ?? 0) + 1);
  }
  const states = [...byState.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return (
    <section
      aria-labelledby="coverage"
      className="mx-auto mt-20 max-w-6xl px-6"
    >
      <div className="border-t-2 border-charcoal/70 pt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
          Coverage
        </p>
        <h2
          id="coverage"
          className="mt-3 max-w-2xl text-3xl leading-tight text-charcoal"
          style={{ fontFamily: SERIF_DISPLAY }}
        >
          Where the archive has records today.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/80">
          This is every state and union territory currently represented in the
          archive, counted from the records themselves. It is a small and
          deliberately incomplete map: most of India&rsquo;s regional cooking has
          no source-cited record here yet. A dish is only added once a source
          for it can be cited, which is slower than copying a recipe blog and
          much harder to fake.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {states.map(([state, count]) => (
            <li
              key={state}
              className="flex items-center justify-between gap-4 rounded-xl border border-charcoal/10 bg-charcoal/[0.03] px-4 py-3"
            >
              <span className="text-[15px] font-medium text-charcoal">{state}</span>
              <span className="text-sm text-charcoal/80">
                {count} {count === 1 ? "record" : "records"}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-charcoal/80">
          States with no record yet are simply absent. Listing them as
          &ldquo;coming soon&rdquo; would be a promise the archive cannot keep on
          a citation-first basis.
        </p>
      </div>
    </section>
  );
}

export default function RecipesIndexPage() {
  return <RecipesIndexContent recipes={getAllRecipes()} />;
}
