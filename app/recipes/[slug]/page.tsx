import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import {
  getAllRecipes,
  getRecipeBySlug,
  type LoadedRecipe,
} from "@/lib/content/recipes";
import {
  DIETARY_TAG_LABELS,
  SERIF_DISPLAY,
  TRUST_LABELS,
  formatMinutes,
  formatRegionLine,
  formatSeasonWindow,
  totalTimeMinutes,
} from "@/lib/content/recipe-presentation";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllRecipes().map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe not found - Aaharai" };

  return {
    title: `${recipe.title} - Aaharai`,
    description: `${recipe.title} from ${recipe.region.state}, with explicit source and review records and recomputed nutrition estimates.`,
  };
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
        {kicker}
      </p>
      <h2
        className="mt-2 text-3xl text-charcoal"
        style={{ fontFamily: SERIF_DISPLAY }}
      >
        {title}
      </h2>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70">
      {children}
    </span>
  );
}

function ProvenancePanel({ recipe }: { recipe: LoadedRecipe }) {
  if (recipe.trustLabel === "ai-created") return null;
  const verification = recipe.verification;
  const lineage = "lineage" in recipe ? recipe.lineage : undefined;

  return (
    <div className="rounded-2xl border border-clay/25 bg-charcoal/[0.04] p-1.5 shadow-xl shadow-charcoal/10">
      <div className="divide-y divide-dashed divide-clay/25 rounded-xl border border-clay/30">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
            Source and review record
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/60">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            {TRUST_LABELS[recipe.trustLabel]}
          </p>
        </div>

        {lineage && lineage.entries.length > 0 ? (
          <ul>
            {lineage.entries.map((entry, index) => (
              <li
                key={`${entry.name}-${index}`}
                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-4 sm:px-7"
              >
                <span
                  className="shrink-0 text-base font-semibold text-charcoal sm:w-48"
                  style={{ fontFamily: SERIF_DISPLAY }}
                >
                  {entry.name}
                </span>
                <span className="flex-1 text-sm text-charcoal/60">
                  {[entry.relation, entry.place].filter(Boolean).join(" · ") || "—"}
                </span>
                {entry.era ? (
                  <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
                    {entry.era}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {lineage?.publishedRef ? (
          <div className="px-5 py-3.5 sm:px-7">
            <p className="text-sm italic text-charcoal/60">
              Published reference: {lineage.publishedRef}
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 px-5 py-4 text-sm text-charcoal/70 sm:grid-cols-2 sm:px-7">
          <p>
            <span className="font-semibold text-charcoal">Review record:</span>{" "}
            {verification.verifierName}
          </p>
          <p>
            <span className="font-semibold text-charcoal">Review date:</span>{" "}
            <time dateTime={verification.verifiedAt}>{verification.verifiedAt}</time>
          </p>
          <p>
            <span className="font-semibold text-charcoal">Source IDs:</span>{" "}
            {recipe.sourceIds.join(", ")}
          </p>
          <p>
            <span className="font-semibold text-charcoal">Evidence:</span>{" "}
            {recipe.reviewEvidenceId} · {recipe.sourceFidelityId}
          </p>
        </div>

        {recipe.trustLabel === "community-tested" ? (
          <div className="px-5 py-4 text-sm text-charcoal/70 sm:px-7">
            <p className="font-semibold text-charcoal">Community testing evidence:</p>
            <p className="mt-1">
              {recipe.communityTestingEvidence.method} · {recipe.communityTestingEvidence.participants} · recorded {recipe.communityTestingEvidence.recordedAt}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NutritionPanel({ recipe }: { recipe: LoadedRecipe }) {
  return (
    <section aria-label="Nutrition" className="mx-auto mt-14 max-w-4xl border-t border-charcoal/10 px-6 pt-12">
      <SectionHeading kicker="Composition" title="Nutrition" />
      <p className="-mt-4 mb-6 text-sm leading-relaxed text-charcoal/60">
        Values are per serving and retain their source and estimate status. They are not medical advice.
      </p>
      <div className="overflow-hidden rounded-xl border border-charcoal/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal/[0.05] text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Nutrient</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {recipe.nutrition.values.map((value) => (
              <tr key={`${value.nutrient}-${value.unit}`}>
                <td className="px-4 py-3 capitalize text-charcoal">{value.nutrient}</td>
                <td className="px-4 py-3 text-charcoal/75">
                  {value.amount} {value.unit}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-charcoal/60">{value.sourceId}</td>
                <td className="px-4 py-3 text-charcoal/60">{value.estimated ? "Estimated" : "Cited"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-charcoal/50">Serving: {recipe.nutrition.servingLabel}</p>
    </section>
  );
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  const totalMinutes = totalTimeMinutes(recipe);
  const initial = [...recipe.nativeName.text.trim()][0] ?? recipe.title.charAt(0);
  const bodyParagraphs = recipe.body
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return (
    <article className="pb-24">
      <header className="relative overflow-hidden border-b border-charcoal/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 90% at 85% 0%, rgba(242,204,143,0.35) 0%, rgba(242,204,143,0) 60%), radial-gradient(45% 80% at 8% 100%, rgba(129,178,154,0.28) 0%, rgba(129,178,154,0) 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
            {TRUST_LABELS[recipe.trustLabel]} · {recipe.region.state}
          </p>

          <h1
            className="mt-8 text-7xl leading-tight text-charcoal md:text-8xl"
            style={{ fontFamily: SERIF_DISPLAY }}
          >
            {recipe.nativeName.text}
          </h1>

          {(recipe.transliteration || recipe.dialectVariant) && (
            <p className="mt-4 text-lg text-charcoal/70">
              {recipe.transliteration && (
                <span className="italic" style={{ fontFamily: SERIF_DISPLAY }}>
                  {recipe.transliteration}
                </span>
              )}
              {recipe.transliteration && recipe.dialectVariant && (
                <span aria-hidden> · </span>
              )}
              {recipe.dialectVariant && (
                <span className="text-base text-charcoal/50">
                  {recipe.dialectVariant}
                </span>
              )}
            </p>
          )}

          <p className="mx-auto mt-4 max-w-xl text-xs uppercase leading-relaxed tracking-[0.18em] text-charcoal/50">
            {recipe.title}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-charcoal/60">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              {formatMinutes(totalMinutes)} total
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden />
              Serves {recipe.servings}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {formatRegionLine(recipe)}
            </span>
          </div>

          <div className="relative mt-12 h-44 overflow-hidden rounded-2xl border border-charcoal/10 md:h-60">
            {recipe.heroImage ? (
              <Image
                src={recipe.heroImage}
                alt={`${recipe.title} - hero photograph`}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(242,204,143,0.55), rgba(224,122,95,0.40))",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 flex select-none items-center justify-center text-[7rem] leading-none text-charcoal/75 md:text-[9rem]"
                  style={{ fontFamily: SERIF_DISPLAY }}
                >
                  {initial}
                </span>
                <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.3em] text-charcoal/60">
                  Aaharai Archive
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto -mt-14 max-w-3xl px-6">
        <ProvenancePanel recipe={recipe} />
      </div>

      <section aria-label="When it is served" className="mx-auto max-w-4xl px-6 pt-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-charcoal/45">
            Served at
          </span>
          {recipe.occasions.map((occasion) => (
            <Chip key={occasion}>{occasion}</Chip>
          ))}
          <Chip>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              In season: {formatSeasonWindow(recipe)}
            </span>
          </Chip>
          {recipe.dietaryTags.map((tag) => (
            <Chip key={tag}>{DIETARY_TAG_LABELS[tag]}</Chip>
          ))}
        </div>
      </section>

      <section aria-label="Ingredients" className="mx-auto mt-14 max-w-4xl border-t border-charcoal/10 px-6 pt-12">
        <SectionHeading kicker="The List" title="Ingredients" />
        {recipe.languageNote && (
          <p className="-mt-4 mb-7 text-sm italic text-charcoal/55">
            On language: {recipe.languageNote}
          </p>
        )}
        <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li
              key={`${ingredient.ingredientId}-${index}`}
              className="flex items-baseline gap-3 border-b border-dotted border-charcoal/15 pb-3"
            >
              <span className="w-20 shrink-0 font-mono text-sm text-charcoal/70">
                {ingredient.quantity} {ingredient.unit}
              </span>
              <span className="text-[15px] text-charcoal">
                <span className="font-mono text-sm">{ingredient.ingredientId}</span>
                {ingredient.note && (
                  <span className="block text-sm leading-snug text-charcoal/55">
                    {ingredient.note}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-charcoal/50">
          Allergens: {recipe.allergenIds.length > 0 ? recipe.allergenIds.map((allergen) => typeof allergen === "string" ? allergen : allergen.label).join(", ") : "none declared"}
        </p>
      </section>

      <section aria-label="Method" className="mx-auto mt-14 max-w-4xl border-t border-charcoal/10 px-6 pt-12">
        <SectionHeading kicker="Method" title="Step by step" />
        <ol className="space-y-9">
          {recipe.steps.map((step, index) => (
            <li key={index} className="grid grid-cols-[3rem_1fr] items-start gap-4 sm:grid-cols-[4.5rem_1fr]">
              <span
                aria-hidden
                className="text-4xl leading-none text-clay/80"
                style={{ fontFamily: SERIF_DISPLAY }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="leading-relaxed text-charcoal/85">{step.text}</p>
                {step.technique && (
                  <span className="mt-2.5 inline-block rounded-full border border-charcoal/10 bg-charcoal/[0.05] px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-charcoal/60">
                    Technique · {step.technique}
                  </span>
                )}
                {step.tip && (
                  <p className="mt-2.5 border-l-2 border-sage/50 pl-3 text-sm italic leading-relaxed text-charcoal/65">
                    Tip — {step.tip}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {recipe.variations.length > 0 && (
        <section aria-label="Variations" className="mx-auto mt-14 max-w-4xl border-t border-charcoal/10 px-6 pt-12">
          <SectionHeading kicker="House to House" title="Variations" />
          <ul className="grid gap-4 sm:grid-cols-2">
            {recipe.variations.map((variation, index) => (
              <li
                key={`${variation.label}-${index}`}
                className="rounded-xl border border-charcoal/10 bg-charcoal/[0.03] p-5"
              >
                <p
                  className="font-semibold text-charcoal"
                  style={{ fontFamily: SERIF_DISPLAY }}
                >
                  {variation.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/65">
                  {variation.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <NutritionPanel recipe={recipe} />

      {recipe.substitutionIds.length > 0 && (
        <section aria-label="Substitutions" className="mx-auto mt-14 max-w-4xl border-t border-charcoal/10 px-6 pt-12">
          <SectionHeading kicker="Catalog links" title="Substitutions" />
          <ul className="flex flex-wrap gap-2">
            {recipe.substitutionIds.map((id) => (
              <li key={id}>
                <code className="rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/65">
                  {id}
                </code>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.authenticityNotes && (
        <aside className="mx-auto mt-14 max-w-4xl px-6">
          <div className="rounded-xl border border-clay/25 bg-clay/[0.06] p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
              <Info className="h-4 w-4 shrink-0" aria-hidden />
              Authenticity Notes
            </p>
            <p
              className="mt-3 italic leading-relaxed text-charcoal/85"
              style={{ fontFamily: SERIF_DISPLAY }}
            >
              {recipe.authenticityNotes}
            </p>
          </div>
        </aside>
      )}

      {bodyParagraphs.length > 0 && (
        <section aria-label="Family notes" className="mx-auto mt-14 max-w-3xl border-t border-charcoal/10 px-6 pt-12">
          <SectionHeading kicker="Family Notes" title="From the keeper of this recipe" />
          <div className="space-y-5 leading-relaxed text-charcoal/75">
            {bodyParagraphs.map((paragraph, index) =>
              index === 0 ? (
                <p
                  key={index}
                  className="first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-clay"
                  style={{ fontFamily: SERIF_DISPLAY }}
                >
                  {paragraph}
                </p>
              ) : (
                <p key={index}>{paragraph}</p>
              ),
            )}
          </div>
        </section>
      )}

      <footer className="mx-auto mt-16 max-w-4xl border-t border-charcoal/10 px-6 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/60 transition-colors hover:text-clay"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All source-cited recipes
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40">
            Source-cited records
          </p>
        </div>
      </footer>
    </article>
  );
}
