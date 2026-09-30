import Link from "next/link";
import { Leaf } from "lucide-react";

const explore = [
  { name: "Recipes", href: "/recipes" },
  { name: "Prakriti Quiz", href: "/prakriti-test" },
  { name: "Daily Rituals", href: "/dinacharya" },
  { name: "Satvik Scanner", href: "/scanner" },
];

const learn = [
  { name: "Ancient Library", href: "/library" },
  { name: "The Science", href: "/science" },
  { name: "Junk Swapper", href: "/swapper" },
  { name: "Remedies", href: "/nuskhe" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-charcoal/10">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay text-white"
                aria-hidden
              >
                <Leaf className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-charcoal">
                Aahar<span className="text-clay">ai</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/80">
              An Ayurvedic AI assistant pairing classical principles with a
              curated, source-cited atlas of regional Indian food.
            </p>
          </div>

          {/* Link columns */}
          <nav aria-label="Explore">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Explore
            </h2>
            <ul className="mt-4 space-y-3">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-charcoal/80 transition-colors hover:text-clay"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Learn">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Learn
            </h2>
            <ul className="mt-4 space-y-3">
              {learn.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-charcoal/80 transition-colors hover:text-clay"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sources */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Provenance
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/80">
              Every public recipe names its source record, ingredient form,
              adaptation boundary, and nutrition source. A
              <span className="whitespace-nowrap"> source-cited </span>
              label is not a claim of community testing or laboratory
              measurement.
            </p>
            <Link
              href="/recipes"
              className="mt-4 inline-block text-sm font-medium text-charcoal underline decoration-charcoal/30 underline-offset-4 transition-colors hover:decoration-clay"
            >
              Browse the archive
            </Link>
          </div>
        </div>

        {/* Wellness notice — the app gives dietary and routine guidance, so the
            general-wellness boundary is stated once, site-wide. */}
        <div className="mt-12 rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
            General wellness guidance
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-charcoal/80">
            Aaharai offers general-wellness guidance drawn from Ayurvedic
            tradition and cited sources. It is not medical advice, diagnosis, or
            treatment, and it does not replace care from a qualified clinician.
            Nutrition figures retain their source and estimate status, and are
            not laboratory measurements unless explicitly marked as cited.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-charcoal/10 pt-6 text-xs text-charcoal/80 sm:flex-row sm:items-center sm:justify-between">
          <p>Aaharai &mdash; Make India Healthy Again.</p>
          <p>Source-cited regional recipes, rendered from reviewed content.</p>
        </div>
      </div>
    </footer>
  );
}
