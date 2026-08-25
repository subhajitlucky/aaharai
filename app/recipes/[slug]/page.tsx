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
  DIETARY_FRAME_LABELS,
  SERIF_DISPLAY,
  SOURCE_TYPE_PRESENTATION,
  VERIFICATION_TIER_LABELS,
  formatMinutes,
  formatRegionLine,
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

  const regionBits = [recipe.region.state, recipe.region.community]
    .filter(Boolean)
    .join(" · ");
  const description =
    `${DIETARY_FRAME_LABELS[recipe.dietaryFrame]} recipe from ${regionBits}. ` +
    `Traced through ${recipe.lineage.entries.length} lineage keeper${recipe.lineage.entries.length === 1 ? "" : "s"} and verified by ${recipe.verification.verifierName} (${VERIFICATION_TIER_LABELS[recipe.verification.tier]}).`;

  return {
    title: `${recipe.title} - Aaharai`,
    description,
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

/* Certificate-styled provenance panel: tinted surface inside a double frame. */
function ProvenancePanel({ recipe }: { recipe: LoadedRecipe }) {
  const source = SOURCE_TYPE_PRESENTATION[recipe.lineage.sourceType];
  return (
    <div className="rounded-2xl border border-clay/25 bg-charcoal/[0.04] p-1.5 shadow-xl shadow-charcoal/10">
      <div className="divide-y divide-dashed divide-clay/25 rounded-xl border border-clay/30">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
            Certificate of Provenance
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/60">
            <source.icon className="h-4 w-4" aria-hidden />
            {source.label}
          </p>
        </div>

        <ul>
          {recipe.lineage.entries.map((entry, index) => (
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

        {recipe.lineage.publishedRef ? (
          <div className="px-5 py-3.5 sm:px-7">
            <p className="text-sm italic text-charcoal/60">
              Published reference: {recipe.lineage.publishedRef}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-7">
          <p className="inline-flex items-center gap-2 text-sm text-charcoal/70">
            <BadgeCheck className="h-4 w-4 shrink-0 text-sage-hover" aria-hidden />
            <span>
              Verified by <strong className="font-semibold">{recipe.verification.verifierName}</strong>
            </span>
          </p>
          <p className="flex items-center gap-3 text-sm">
            <time className="font-mono text-xs text-charcoal/50" dateTime={recipe.verification.verifiedAt}>
              {recipe.verification.verifiedAt}
            </time>
            <span className="rounded-full border border-sage/50 bg-sage/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-charcoal">
              {VERIFICATION_TIER_LABELS[recipe.verification.tier]}
            </span>
          </p>
        </div>
      </div>
    </div>
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
            {VERIFICATION_TIER_LABELS[recipe.verification.tier]} ·{" "}
            {recipe.region.state}
          </p>

          {/* Native script, huge */}
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

          {/* Hero image, or an initial-letter placeholder block */}
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

      {/* ── Provenance chain, overlapping the hero edge ──────────────────── */}
      <div className="relative z-10 mx-auto -mt-14 max-w-3xl px-6">
        <ProvenancePanel recipe={recipe} />
      </div>

      {/* ── Occasions · season · dietary frame ───────────────────────────── */}
      <section aria-label="When it is served" className="mx-auto max-w-4xl px-6 pt-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-charcoal/45">
            Served at
          </span>
          {recipe.occasions.map((occasion) => (
            <Chip key={occasion}>{occasion}</Chip>
          ))}
          {recipe.seasonalWindow && (
            <Chip>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                In season: {recipe.seasonalWindow}
              </span>
            </Chip>
          )}
          <span className="ml-auto rounded-full border border-sage/40 bg-sage/15 px-3.5 py-1 text-xs font-semibold text-charcoal">
            {DIETARY_FRAME_LABELS[recipe.dietaryFrame]}
          </span>
        </div>
      </section>

      {/* ── Ingredients ──────────────────────────────────────────────────── */}
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
              key={`${ingredient.item}-${index}`}
              className="flex items-baseline gap-3 border-b border-dotted border-charcoal/15 pb-3"
            >
              <span className="w-20 shrink-0 font-mono text-sm text-charcoal/70">
                {ingredient.qty}
              </span>
              <span className="text-[15px] text-charcoal">
                {ingredient.item}
                {ingredient.nativeTerm && (
                  <em className="ml-1.5 text-clay">({ingredient.nativeTerm})</em>
                )}
                {ingredient.note && (
                  <span className="block text-sm leading-snug text-charcoal/55">
                    {ingredient.note}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Method ───────────────────────────────────────────────────────── */}
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

      {/* ── Variations ───────────────────────────────────────────────────── */}
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

      {/* ── Authenticity notes callout ───────────────────────────────────── */}
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

      {/* ── Prose body ───────────────────────────────────────────────────── */}
      {bodyParagraphs.length > 0 && (
        <section aria-label="Family notes" className="mx-auto mt-14 max-w-3xl border-t border-charcoal/10 px-6 pt-12">
          <SectionHeading kicker="Family Notes" title="From the keeper of this recipe" />
          <div className="space-y-5 leading-relaxed text-charcoal/75">
            {bodyParagraphs.map((paragraph, index) =>
              index === 0 ? (
                <p key={index} className="first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-clay" style={{ fontFamily: SERIF_DISPLAY }}>
                  {paragraph}
                </p>
              ) : (
                <p key={index}>{paragraph}</p>
              )
            )}
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mx-auto mt-16 max-w-4xl border-t border-charcoal/10 px-6 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/60 transition-colors hover:text-clay"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All verified recipes
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40">
            Verified Regional Authenticity
          </p>
        </div>
      </footer>
    </article>
  );
}
