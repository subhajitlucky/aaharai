# Aaharai 🌿

> Make India Healthy Again — with Ancient Wisdom and AI.

Aaharai is an Ayurvedic AI wellness assistant. It pairs classical Ayurvedic
principles (prakriti, dinacharya, ritucharya) with AI via OpenRouter to turn
everyday food choices into personalized, seasonal guidance, alongside a curated
atlas of source-cited regional recipes.

## Features

- **Prakriti Quiz** (`/prakriti-test`) — determine your Vata / Pitta / Kapha
  constitution; the result is saved to your user profile.
- **Dashboard** (`/dashboard`) — 21-day Satvik challenge streak, points, and
  recent activity, derived from real logged data (no fabricated fallbacks).
- **Recipe Atlas** (`/recipes`) — 12 verified regional recipes. Each record names
  its source, ingredient form, adaptation boundary, and nutrition source.
- **Recipe Detail** (`/recipes/[slug]`) — provenance chain, nutrition with
  explicit estimate status, substitutions, and seasonal context.
- **Food Scanner** (`/scanner`) — snap a meal photo; AI returns a Prana Score
  and Satvik/Rajasik/Tamasik classification, logged to your history and streak.
- **Swapper** (`/swapper`) — swap an unhealthy ingredient for a healthier
  Ayurvedic alternative.
- **Nuskhe** (`/nuskhe`) — traditional home remedies.
- **Dinacharya** (`/dinacharya`) — daily routine aligned to the Ayurvedic clock.
- **Ritucharya** (`/api/ritucharya`) — seasonal logic (Kapha/Pitta/Vata seasons)
  that optionally adapts advice using geolocation.
- **Library / Vault** (`/library`) — reference content on the science behind it all.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Auth | next-auth v4 — Google OAuth + Prisma adapter (JWT sessions) |
| ORM / DB | Prisma 7 + PostgreSQL |
| Validation | zod v4 |
| Styling | Tailwind CSS v4 with `@theme` tokens (`app/globals.css`) |
| AI | OpenRouter chat completions (`lib/ai.ts`, free-tier model) |
| Testing | Vitest + Testing Library (unit), Playwright (smoke) |
| UI extras | framer-motion, lucide-react |

## Getting Started

Prerequisites: Node.js 20+ (CI uses 24), a PostgreSQL database, a Google OAuth
client (Web application), and an OpenRouter API key.

1. Install dependencies:
   ```bash
   npm install
   ```
   This runs `prisma generate` automatically via `postinstall`.

2. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Apply the database schema:
   ```bash
   npm run db:migrate        # production-style (migrate deploy)
   npm run db:migrate:dev    # local development (creates new migrations)
   ```

4. Start the dev server and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## Environment Variables

Mirrors `.env.example` — never commit real values.

| Variable | Purpose | Required to build? |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma (`prisma.config.ts`) | No — only at runtime |
| `NEXTAUTH_SECRET` | Secret used by next-auth to sign/encrypt session tokens | No |
| `NEXTAUTH_URL` | Canonical app URL; read internally by next-auth (needed beyond localhost) | No |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | No |
| `OPENROUTER_API_KEY` | OpenRouter API key powering the AI routes | No |
| `NEXT_PUBLIC_SITE_URL` | Public base URL sent to OpenRouter as HTTP-Referer | No |

The build succeeds without any of these — the site is fully static except for
`/dashboard` and the `/api/*` routes, which resolve `DATABASE_URL` lazily at
request time (see `lib/prisma.ts`). Set every variable above in your host's
dashboard before expecting auth, logging, or AI features to work.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Validate data, then production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit/component suite |
| `npm run test:coverage` | Vitest with v8 coverage + 80% thresholds on core libs |
| `npm run test:e2e` | Playwright smoke tests (requires a prior build in CI) |
| `npm run validate:content` | Validate authored recipe/content files |
| `npm run validate:data` | Validate registries, sources, and cross-references |
| `npm run generate:catalog` | Rebuild the derived catalog from the registries |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:migrate:dev` | `prisma migrate dev` |
| `npm run check` | Full gate: lint → typecheck → test:coverage → validate:data → build |

## Continuous Integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

- **check** — `npm ci`, lint, typecheck, unit tests with coverage thresholds,
  data validation, and a production build. Uploads the coverage report.
- **e2e** — builds, installs Chromium, and runs the Playwright smoke suite
  against the production server.

Neither job needs secrets: `prisma generate` never connects to a database, and
the smoke tests only touch public static routes.

## Deploying to Vercel

1. Import the repo at `github.com/subhajitlucky/aaharai`. Vercel auto-detects
   Next.js; no build settings are required.
2. Provision a Postgres database and set `DATABASE_URL`.
3. Apply the schema once against that database:
   ```bash
   DATABASE_URL="postgres://..." npm run db:migrate
   ```
4. Add the remaining env vars from the table above.
5. Set your Google OAuth client's authorised redirect URI to
   `https://<your-domain>/api/auth/callback/google`.

The `postinstall` script regenerates the Prisma client on every Vercel install,
so no extra build configuration is needed.

## Content Model

Recipes are authored as MDX under `content/recipes/` and are **not** free-form.
`lib/domain/` defines the contracts every record must satisfy:

- **Region & dialect tagging** — e.g. Bengali vs Marathi takes on the same dish.
- **Lineage attribution** — whose kitchen, family tradition, or classical text a
  recipe traces back to.
- **Verification badges** — `source-cited`, `regional-heritage`,
  `community-tested`, and `ai-created` are distinct labels and are never mixed.
- **Content-as-code** — recipes reviewed via PRs and rendered statically.
- **Nutrition honesty** — no public nutrition number appears without a source
  and an explicit estimate status, enforced by `lib/content/reference-validation.ts`.

`npm run validate:data` fails the build on any violation.

## Roadmap

The redesign is specified in full in
`docs/plans/2026-09-25-living-food-atlas-redesign.md`. Shipped so far:

- Verified-Regional-Authenticity Recipes — region/dialect tagging, lineage
  attribution, verification badges, content-as-code pipeline.
- Machine-enforced domain schemas and reference validation.
- Deterministic catalog generation from validated registries.

Still to build from that plan: the personalized weekly meal planner (`/planner`),
district crop guidance (`/sow-eat`), Smart Offline Mode, and the legacy route
compatibility redirects.
