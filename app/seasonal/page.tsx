import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { getAllRecipes } from "@/lib/content/recipes";
import { SERIF_DISPLAY } from "@/lib/content/recipe-presentation";
import type { SourcedRecipe } from "@/lib/content/schema";

export const metadata: Metadata = {
  title: "Seasonal Calendar",
  description:
    "A month-by-month view of the source-cited recipes in the Aaharai archive, derived from the recorded season window on each record.",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Does this record's recorded season window include the given month? */
function inSeason(recipe: SourcedRecipe, month: number): boolean {
  const { startMonth, endMonth } = recipe.seasonWindow;
  // A window that wraps the year end (e.g. Nov -> Feb) is handled explicitly.
  return startMonth <= endMonth
    ? month >= startMonth && month <= endMonth
    : month >= startMonth || month <= endMonth;
}

function isAllYear(recipe: SourcedRecipe): boolean {
  return recipe.seasonWindow.startMonth === 1 && recipe.seasonWindow.endMonth === 12;
}

export default function SeasonalPage() {
  const recipes = getAllRecipes();
  const seasonal = recipes.filter((r) => !isAllYear(r));
  const allYear = recipes.filter(isAllYear);

  const monthsWithRecipes = MONTHS.map((name, index) => ({
    name,
    month: index + 1,
    items: seasonal.filter((recipe) => inSeason(recipe, index + 1)),
  }));

  return (
    <div className="pb-24">
      <header className="mx-auto max-w-6xl px-6 pb-10 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
          The Aaharai Archive · Seasonal calendar
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h1
            className="max-w-2xl text-4xl leading-tight text-charcoal md:text-5xl"
            style={{ fontFamily: SERIF_DISPLAY }}
          >
            What the record says, month by month.
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
              records placed
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl leading-relaxed text-charcoal/80">
          Every recipe in the archive carries a recorded season window. This page
          is generated from those fields alone. It is not a live weather,
          agricultural, or market feed, and it does not claim to know what is in
          season where you are standing.
        </p>
        <div aria-hidden className="mt-9">
          <div className="border-t-2 border-charcoal/70" />
          <div className="mt-1 border-t border-charcoal/20" />
        </div>
      </header>

      <section aria-label="Recipes by month" className="mx-auto mt-12 max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monthsWithRecipes.map(({ name, items }) => (
            <div
              key={name}
              className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-6"
            >
              <h2 className="flex items-center gap-2 text-lg text-charcoal" style={{ fontFamily: SERIF_DISPLAY }}>
                <CalendarDays className="h-4 w-4 shrink-0 text-clay" aria-hidden />
                {name}
              </h2>
              {items.length === 0 ? (
                <p className="mt-3 text-sm text-charcoal/80">
                  No seasonal record starts or runs in {name} yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {items.map((recipe) => (
                    <li key={recipe.slug}>
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="block text-[15px] font-medium text-charcoal underline decoration-charcoal/20 underline-offset-4 transition-colors hover:decoration-clay"
                      >
                        {recipe.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-charcoal/80">
                        {recipe.region.state}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="all-year" className="mx-auto mt-16 max-w-6xl px-6">
        <div className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-8">
          <h2 id="all-year" className="text-2xl text-charcoal" style={{ fontFamily: SERIF_DISPLAY }}>
            Available through the year
          </h2>
          <p className="mt-2 text-sm text-charcoal/80">
            {allYear.length} of {recipes.length} records are recorded as available
            in every month, so they are not repeated above.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {allYear.map((recipe) => (
              <li key={recipe.slug}>
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="inline-block rounded-full border border-charcoal/15 bg-white/40 px-4 py-2 text-sm text-charcoal transition-colors hover:border-clay/50 hover:text-clay"
                >
                  {recipe.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
