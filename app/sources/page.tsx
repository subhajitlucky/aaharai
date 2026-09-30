import type { Metadata } from "next";
import { BadgeCheck, BookOpen, Scale, ShieldAlert, History } from "lucide-react";
import { loadContentRegistries } from "@/lib/content/registries";
import { SERIF_DISPLAY, TRUST_LABELS } from "@/lib/content/recipe-presentation";
import type { SourcedRecipe } from "@/lib/content/schema";

export const metadata: Metadata = {
  title: "Sources & Editorial Policy",
  description:
    "Every source Aaharai cites, the rights under which each is used, what each verification tier means, how corrections are handled, and the limits of what AI can claim here.",
};

const TIERS: {
  label: SourcedRecipe["trustLabel"];
  meaning: string;
  boundary: string;
}[] = [
  {
    label: "source-cited",
    meaning:
      "The record names the published or institutional source the method and composition came from.",
    boundary:
      "Citing a source is not the same as reproducing or measuring the dish. Nothing here is a laboratory result unless it says so.",
  },
  {
    label: "regional-heritage",
    meaning:
      "The dish is documented as belonging to a named region or community with a recorded lineage.",
    boundary:
      "Lineage is stated only where a source supports it. An undated claim of ancestry is not recorded as heritage.",
  },
  {
    label: "community-tested",
    meaning:
      "A real community cook tested and reported on the preparation, and that report is stored with the record.",
    boundary:
      "Requires a documented test. This label is not used for a recipe merely because it is common.",
  },
  {
    label: "ai-created",
    meaning: "The content was generated rather than transcribed from a source.",
    boundary:
      "Never presented as heritage or as sourced. Labelled as AI-created wherever it appears.",
  },
];

const CORRECTIONS = [
  {
    title: "Report a factual error",
    body: "If a record misstates a method, misattributes a region, or carries a wrong citation, it should be corrected rather than defended.",
  },
  {
    title: "Citations are re-checked",
    body: "Every source carries a review audit, a rights statement, and an explicit usage boundary. Those are re-verified whenever the registry changes.",
  },
  {
    title: "Corrections are recorded, not hidden",
    body: "A corrected record keeps its history in version control. Nothing is quietly rewritten to make a previous claim disappear.",
  },
  {
    title: "Estimates stay labelled",
    body: "A nutrition figure that is computed rather than measured keeps its estimated status. It is never presented as cited.",
  },
];

const AI_LIMITS = [
  "No public nutrition number appears without a registered source and an explicit estimate status.",
  "AI never bypasses an allergy or dietary exclusion recorded against a profile.",
  "AI output is never labelled as sourced heritage.",
  "The core product works with no AI key, no account, and no network request.",
  "Nothing here is medical advice, diagnosis, or treatment.",
];

export default function SourcesPage() {
  // loadContentRegistries nests each registry under its versioned catalog
  // wrapper, so unwrap the source list here.
  const { sources } = loadContentRegistries().sources;

  return (
    <div className="pb-24">
      <header className="mx-auto max-w-6xl px-6 pb-10 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-clay">
          The Aaharai Archive · Editorial policy
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h1
            className="max-w-2xl text-4xl leading-tight text-charcoal md:text-5xl"
            style={{ fontFamily: SERIF_DISPLAY }}
          >
            Where every claim comes from.
          </h1>
          <div className="hidden shrink-0 text-right sm:block">
            <p
              className="text-5xl leading-none text-clay"
              style={{ fontFamily: SERIF_DISPLAY }}
              aria-hidden
            >
              {sources.length}
            </p>
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-charcoal/80">
              registered sources
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl leading-relaxed text-charcoal/80">
          Aaharai claims authenticity as a verifiable property, not as marketing.
          That only works if the boundary of each claim is stated as precisely as
          the claim itself. This page is the editorial policy behind every record
          in the archive.
        </p>
        <div aria-hidden className="mt-9">
          <div className="border-t-2 border-charcoal/70" />
          <div className="mt-1 border-t border-charcoal/20" />
        </div>
      </header>

      {/* Verification tiers */}
      <section aria-labelledby="tiers" className="mx-auto mt-14 max-w-6xl px-6">
        <h2 id="tiers" className="text-2xl text-charcoal" style={{ fontFamily: SERIF_DISPLAY }}>
          What each label means
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/80">
          These four labels are distinct and are never merged. A record carries
          exactly one.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.label}
              className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-6"
            >
              <p className="inline-flex items-center gap-1.5 rounded-full border border-clay/50 bg-clay/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-charcoal">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                {TRUST_LABELS[tier.label]}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-charcoal">
                {tier.meaning}
              </p>
              <p className="mt-3 border-t border-charcoal/10 pt-3 text-sm leading-relaxed text-charcoal/80">
                <span className="font-semibold text-charcoal">Boundary. </span>
                {tier.boundary}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Source registry */}
      <section aria-labelledby="registry" className="mx-auto mt-16 max-w-6xl px-6">
        <h2 id="registry" className="text-2xl text-charcoal" style={{ fontFamily: SERIF_DISPLAY }}>
          Source registry
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/80">
          Each entry states where the material came from, the rights under which
          it is used, and the boundary of that use.
        </p>
        <ul className="mt-8 space-y-4">
          {sources.map((source) => (
            <li
              key={source.id}
              className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold text-charcoal">
                    {source.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/80">
                    {source.citation}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-charcoal/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal">
                  {source.sourceType.replace(/-/g, " ")}
                </span>
              </div>

              <dl className="mt-5 grid gap-4 border-t border-charcoal/10 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal">
                    <Scale className="h-3.5 w-3.5" aria-hidden />
                    Rights
                  </dt>
                  <dd className="mt-1.5 text-sm text-charcoal/80">
                    <span className="font-medium text-charcoal">{source.rights}</span>
                    {source.licenseUrl && (
                      <>
                        {" · "}
                        <a
                          href={source.licenseUrl}
                          className="underline decoration-charcoal/30 underline-offset-4 hover:decoration-clay"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          licence
                        </a>
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    Usage boundary
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-charcoal/80">
                    {source.usageBoundary}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-charcoal/10 pt-4 text-xs text-charcoal/80">
                <History className="h-3.5 w-3.5" aria-hidden />
                <span>Reviewed by {source.reviewedBy}</span>
                <span aria-hidden>·</span>
                <span>{source.reviewedAt}</span>
                {source.accessedAt && (
                  <>
                    <span aria-hidden>·</span>
                    <span>accessed {source.accessedAt}</span>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Corrections */}
      <section aria-labelledby="corrections" className="mx-auto mt-16 max-w-6xl px-6">
        <h2 id="corrections" className="text-2xl text-charcoal" style={{ fontFamily: SERIF_DISPLAY }}>
          Corrections
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {CORRECTIONS.map((item) => (
            <li key={item.title} className="border-l-2 border-clay/50 pl-4">
              <h3 className="text-[15px] font-semibold text-charcoal">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/80">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* AI limits */}
      <section
        aria-labelledby="ai-limits"
        className="mx-auto mt-16 max-w-6xl px-6"
      >
        <div className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-8">
          <h2
            id="ai-limits"
            className="flex items-center gap-2.5 text-2xl text-charcoal"
            style={{ fontFamily: SERIF_DISPLAY }}
          >
            <ShieldAlert className="h-6 w-6 shrink-0 text-clay" aria-hidden />
            What AI cannot do here
          </h2>
          <ul className="mt-5 space-y-3">
            {AI_LIMITS.map((limit) => (
              <li key={limit} className="flex gap-3 text-sm leading-relaxed text-charcoal/80">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-clay" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
