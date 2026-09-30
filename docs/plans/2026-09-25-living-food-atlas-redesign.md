# Aaharai Living Food Atlas Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Aaharai into an India-first, AI-first personalized food platform that provides curated regional recipes, explainable weekly meal plans, district crop guidance, grocery lists, and a complete Smart Offline Mode without requiring an account or backend.

**Architecture:** Keep Next.js App Router as the application shell, replace server-dependent wellness flows with validated local domain data and versioned browser storage, and use a deterministic recommendation engine as the source of truth. A direct browser-to-provider AI adapter may rank, explain, and remix grounded recipe candidates when the user supplies a session-only API key; every AI operation must degrade to the offline engine.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zod 4, Framer Motion, Lucide, Vitest, Testing Library, Playwright, service worker PWA support.

---

## Approved Product Decisions

- Keep the Aaharai brand.
- Launch for India first and in English.
- Make personalized weekly meal plans the primary outcome.
- Use a curated regional knowledge base rather than AI-generated historical claims.
- Work fully without AI through Smart Offline Mode.
- Let connected AI personalize and explain trusted candidates.
- Keep the API key in memory/session storage only for version one.
- Support future account-backed keys through an adapter without changing page components.
- Use “heritage,” “source-cited,” “community-tested,” and “AI-created” as distinct labels.
- Provide general-wellness guidance only, not diagnosis or treatment.
- Use the “Living Food Atlas” visual direction.
- Remove symptom remedies from the primary product.
- Support district crop guidance from curated static data; do not imply live soil or weather intelligence.
- Never require a key, login, database, or network request for the core product.

## Non-Goals for Version One

- Medical diagnosis, disease treatment, pregnancy guidance, or guaranteed calorie prescriptions.
- BMI-derived treatment plans.
- Live weather, soil, market-price, or satellite crop analysis.
- Community uploads, ratings, or comments before moderation exists.
- Cloud accounts, cross-device sync, payments, or subscriptions.
- AI-authored nutrition values without a cited source.
- Claims that a modern recipe is “ancient” unless the historical connection is sourced and reviewed.
- A generic chatbot detached from the curated food catalog.

## Experience and Information Architecture

Primary routes:

- `/` — command-led homepage.
- `/recipes` — regional and ingredient-first discovery.
- `/recipes/[slug]` — recipe, provenance, nutrition, substitutions, and seasonal context.
- `/planner` — personalized weekly plan and grocery list.
- `/profile` — local wellness profile, preferences, privacy, and AI connection.
- `/seasonal` — month-by-month regional food and festival context.
- `/food-library` — ingredients, grains, millets, pulses, spices, and cooking methods.
- `/sow-eat` — district crop calendar and coverage status.
- `/sow-eat/[district]` — explainable crop guidance.
- `/ai-kitchen` — optional grounded AI chat, image assistance, and substitutions.
- `/my-week` — saved plans, favorites, grocery progress, and offline status.
- `/sources` — source registry, editorial policy, AI limitations, and corrections.
- `/offline` — cached fallback route.

Legacy route compatibility:

- `/prakriti-test` → `/profile`
- `/dashboard` → `/my-week`
- `/swapper` → `/ai-kitchen?mode=swap`
- `/scanner` → `/ai-kitchen?mode=scan`
- `/dinacharya` → `/seasonal`
- `/library` → `/food-library`
- `/science` → `/sources`
- `/nuskhe` → no public primary route; return a clear retired-feature response or 404.

## Quality Invariants

1. The complete core journey works with no API key and no network.
2. AI cannot bypass allergy or dietary exclusions.
3. No public nutrition number lacks a source and estimate status.
4. No district recommendation appears without a curated district record.
5. No AI-generated content is labeled as sourced heritage.
6. User health fields are optional, locally stored by default, and excluded from AI requests unless explicitly enabled.
7. API keys never enter local storage, exports, URLs, analytics, or logs.
8. Corrupt or outdated browser data is migrated or discarded safely.
9. Every core page works at 360px width and with keyboard navigation.
10. AI failures preserve the deterministic plan and explain the fallback.

## Target Domain Model

```ts
export const wellnessProfileSchema = z.object({
  schemaVersion: z.literal(1),
  displayName: z.string().max(40).optional(),
  ageBand: z.enum(["13-17", "18-29", "30-44", "45-59", "60-plus"]),
  gender: z.enum(["woman", "man", "non-binary", "prefer-not-to-say", "self-describe"]).optional(),
  heightCm: z.number().min(100).max(230).optional(),
  weightKg: z.number().min(25).max(300).optional(),
  activity: z.enum(["light", "moderate", "high"]),
  goal: z.enum(["maintain", "lighter", "strength", "comfort", "explore"]),
  region: z.object({
    state: z.string().min(1),
    district: z.string().min(1).optional(),
  }),
  diet: z.array(z.enum(["vegetarian", "vegan", "jain", "no-onion-garlic", "non-veg"])),
  allergies: z.array(z.string().min(1)),
  dislikes: z.array(z.string().min(1)),
  spiceLevel: z.enum(["mild", "medium", "hot"]),
  cookingTime: z.enum(["under-20", "20-45", "45-plus"]),
  weeklyBudget: z.enum(["low", "medium", "flexible"]),
  staples: z.array(z.string().min(1)),
  shareHealthFieldsWithAi: z.boolean().default(false),
});

export type WellnessProfile = z.infer<typeof wellnessProfileSchema>;
```

Rules:

- `gender`, height, and weight are stored only when voluntarily supplied.
- Version one does not calculate BMI, calories, or disease risk.
- Portion guidance remains general and clearly labeled.
- `shareHealthFieldsWithAi` defaults to `false`.
- If false, AI receives cooking preferences, dietary exclusions, region, and the user-selected goal only.

---

### Task 1: Create a Clean Implementation Branch and Repair the Tooling Baseline

**Files:**
- Modify: `package.json:5-40`
- Modify: `package-lock.json`
- Modify: `next.config.ts:3-5`
- Modify: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `playwright.config.ts`
- Create: `.github/workflows/ci.yml`

**Step 1: Start from the latest remote main**

Run:

```bash
git fetch origin
git status --short --branch
git log --oneline --decorate -5 origin/main
```

Expected: the local repository is clean. The audit found local `main` one commit behind the remote MIT-license commit, so reconcile that commit before creating the feature worktree.

Create a dedicated worktree:

```bash
git worktree add ../aaharai-living-food-atlas -b feat/living-food-atlas origin/main
```

Expected: a new branch based on the latest `origin/main`.

**Step 2: Record the current verification baseline**

Run:

```bash
npm run lint
./node_modules/.bin/tsc --noEmit --incremental false
npm run validate:content
npm audit --omit=dev --audit-level=high
```

Expected before repair: TypeScript and content validation pass; lint and audit expose the known failures reported during design review.

**Step 3: Upgrade vulnerable direct dependencies**

Run:

```bash
npm install next@^16.3.6 next-auth@^4.24.15 eslint-config-next@^16.3.6
npm audit --omit=dev --audit-level=high
```

Expected: no known high-severity direct production dependency remains. If a later migration removes NextAuth and Prisma, remove them rather than retaining unused vulnerable packages.

**Step 4: Add test tooling**

Run:

```bash
npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @playwright/test tsx
npx playwright install chromium
```

Expected: test dependencies install and Chromium is available.

**Step 5: Add explicit scripts**

Update `package.json` scripts to include:

```json
{
  "dev": "next dev",
  "build": "npm run validate:data && next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit --incremental false",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "validate:content": "tsx scripts/validate-content.ts",
  "validate:data": "tsx scripts/validate-data.ts",
  "generate:catalog": "tsx scripts/generate-catalog.ts",
  "check": "npm run lint && npm run typecheck && npm run validate:data && npm test && npm run build"
}
```

**Step 6: Add test configuration**

Create `vitest.config.ts` with Node tests for domain logic and jsdom tests for React components. Configure coverage thresholds at 80% for `lib/domain`, `lib/planner`, `lib/storage`, and `lib/ai`.

Create `playwright.config.ts` with a `chromium` project and a `webServer` command of `npm run dev`.

**Step 7: Add a smoke test**

Create `test/smoke/app-shell.test.tsx` that renders the brand, navigation, and main landmark. Run it before fixing the component if needed.

**Step 8: Verify the baseline**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

Expected: all commands exit successfully.

**Step 9: Commit**

```bash
git add package.json package-lock.json next.config.ts eslint.config.mjs vitest.config.ts test/setup.ts playwright.config.ts .github/workflows/ci.yml
git commit -m "chore: establish frontend quality baseline"
```

---

### Task 2: Define Shared Food, Source, Nutrition, and Trust Schemas

**Files:**
- Modify: `lib/content/schema.ts:1-74`
- Create: `lib/domain/source.ts`
- Create: `lib/domain/nutrition.ts`
- Create: `lib/domain/allergen.ts`
- Create: `lib/domain/recipe.ts`
- Create: `lib/domain/index.ts`
- Create: `test/domain/recipe-schema.test.ts`
- Create: `test/domain/source-schema.test.ts`

**Step 1: Write failing schema tests**

Cover these cases:

- A recipe without a source record is invalid.
- Nutrition values require a source, unit, and `estimated` flag.
- Allergens must come from a fixed vocabulary.
- Trust labels cannot claim expert review without a reviewer.
- AI-created recipes cannot carry a source-cited label.
- Filename and slug must match.

Run:

```bash
npm test -- test/domain/recipe-schema.test.ts test/domain/source-schema.test.ts
```

Expected: FAIL because the new schemas do not exist.

**Step 2: Define source records**

Use this shape:

```ts
export const sourceSchema = z.object({
  id: z.string().regex(/^src-[a-z0-9-]+$/),
  title: z.string().min(1),
  sourceType: z.enum([
    "published-cookbook",
    "community-cookbook",
    "oral-history",
    "classical-text",
    "government-food-nutrition-table",
    "research-paper",
  ]),
  citation: z.string().min(1),
  url: z.string().url().optional(),
  accessedAt: z.string().date().optional(),
  rights: z.enum(["cited", "licensed", "public-domain", "permission-obtained"]),
  reviewedBy: z.string().min(1),
  reviewedAt: z.string().date(),
});

export type FoodSource = z.infer<typeof sourceSchema>;
```

**Step 3: Define nutrition records**

Use per-serving values with explicit units and estimate status:

```ts
export const nutritionValueSchema = z.object({
  nutrient: z.string().min(1),
  amount: z.number().nonnegative(),
  unit: z.enum(["kcal", "g", "mg", "µg", "IU"]),
  sourceId: z.string().regex(/^src-[a-z0-9-]+$/),
  estimated: z.boolean(),
});

export const nutritionPanelSchema = z.object({
  servingLabel: z.string().min(1),
  values: z.array(nutritionValueSchema).min(1),
});
```

**Step 4: Extend the recipe contract**

Add:

- Stable recipe ID.
- State and optional district.
- Month-based season window.
- Ingredient IDs and normalized quantities.
- Allergen tags.
- Nutrition panel.
- Source IDs.
- Trust label: `source-cited`, `regional-heritage`, `community-tested`, or `ai-created`.
- Estimated total time and difficulty.
- Substitution IDs.
- Cost tier.
- Diet and season tags.

Retain existing method, variation, and provenance information, but do not use “verified” when only schema validation has occurred.

**Step 5: Run tests**

```bash
npm test -- test/domain/recipe-schema.test.ts test/domain/source-schema.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add lib/content/schema.ts lib/domain test/domain
git commit -m "feat(content): define sourced food data contracts"
```

---

### Task 3: Replace the Placeholder Recipe with a Curated Seed Catalog

**Files:**
- Modify: `content/recipes/_TEMPLATE.mdx`
- Delete: `content/recipes/example-shukto-demo.mdx`
- Create: `content/sources/index.json`
- Create: `content/foods/ingredients.json`
- Create: 12 reviewed recipe files under: `content/recipes/`
- Create: `test/content/no-placeholder-content.test.ts`
- Create: `test/content/source-integrity.test.ts`

**Step 1: Write a failing placeholder test**

Fail if any public recipe contains:

- `[EXAMPLE]`
- `EXAMPLE-BOT`
- “demonstration entry”
- “replace and delete”
- A nutrition number without a source ID
- A trust label unsupported by its source records

Run:

```bash
npm test -- test/content/no-placeholder-content.test.ts
```

Expected: FAIL against the current demonstration recipe.

**Step 2: Build the source registry**

Create a reviewed source registry for recipe provenance and nutrition values. Do not invent citations. If a recipe cannot be supported by an accessible, rights-compatible source, leave it out of the public catalog.

**Step 3: Normalize the ingredient catalog**

Create stable ingredient IDs for staples, grains, millets, pulses, vegetables, fruit, dairy, fats, spices, and animal products used by the seed recipes. Include:

- Canonical name
- Regional names
- Diet tags
- Allergen tags
- Default unit
- Optional nutrition-source IDs
- Substitute ingredient IDs

**Step 4: Add a balanced pilot catalog**

Add 12 regionally distributed, source-attributed recipes across vegetarian, vegan, Jain, no-onion-garlic, and non-vegetarian categories. Include multiple grains and millets, pulses, seasonal vegetables, and cooking methods. The exact slugs are finalized only after source review.

Each recipe must pass the Task 2 schema and include:

- Region and season
- Ingredients and quantities
- Allergens
- Sourced nutrition panel
- Method and technique
- Substitutions
- Cost and time
- Provenance
- Trust label
- Reviewer and review date

**Step 5: Hide or delete the demonstration fixture**

Delete `example-shukto-demo.mdx`. The public recipe index must show an intentional empty state if the reviewed seed catalog is not yet complete.

**Step 6: Run content tests**

```bash
npm test -- test/content
npm run validate:content
```

Expected: PASS with zero public placeholder recipes.

**Step 7: Commit**

```bash
git add content test/content
git commit -m "feat(content): add reviewed regional seed catalog"
```

---

### Task 4: Build Deterministic District Crop Data

**Files:**
- Create: `lib/domain/crop.ts`
- Create: `content/crops/districts.json`
- Create: `lib/crops/catalog.ts`
- Create: `lib/crops/recommendations.ts`
- Create: `test/crops/schema.test.ts`
- Create: `test/crops/recommendations.test.ts`
- Create: `test/crops/coverage.test.ts`

**Step 1: Write failing crop tests**

Cover:

- Invalid district IDs
- Missing source records
- Crops outside the district’s season
- Unsupported soil or water claims
- Duplicate crop-district records
- Empty recommendation results

**Step 2: Define the crop contract**

```ts
export const cropGuidanceSchema = z.object({
  id: z.string().regex(/^crop-[a-z0-9-]+$/),
  districtId: z.string().regex(/^in-[a-z0-9-]+$/),
  crop: z.string().min(1),
  purpose: z.enum(["kitchen-garden", "household", "small-farm"]),
  seasonMonths: z.array(z.number().int().min(1).max(12)).min(1),
  soil: z.array(z.string().min(1)).min(1),
  water: z.enum(["low", "moderate", "high"]),
  durationDays: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  reasons: z.array(z.string().min(1)).min(1),
  cautions: z.array(z.string().min(1)),
  sourceIds: z.array(z.string().regex(/^src-[a-z0-9-]+$/)).min(1),
});
```

**Step 3: Add an honest pilot dataset**

Start with reviewed records for a limited set of districts. The UI must show coverage status and must not silently substitute national-level data for missing districts.

**Step 4: Implement explainable filtering**

Return records only when district, month, purpose, and basic growing constraints match. Return reasons and cautions from the curated record rather than generating new crop claims.

**Step 5: Verify**

```bash
npm test -- test/crops
npm run validate:data
```

Expected: PASS.

**Step 6: Commit**

```bash
git add lib/domain/crop.ts lib/crops content/crops test/crops
git commit -m "feat(crops): add sourced district guidance"
```

---

### Task 5: Add Versioned Local Profile and Privacy Storage

**Files:**
- Create: `lib/profile/schema.ts`
- Create: `lib/profile/defaults.ts`
- Create: `lib/storage/versioned-store.ts`
- Create: `lib/storage/profile-store.ts`
- Create: `lib/storage/collections-store.ts`
- Create: `components/providers/ProfileProvider.tsx`
- Create: `test/storage/versioned-store.test.ts`
- Create: `test/storage/profile-store.test.ts`

**Step 1: Write failing storage tests**

Cover:

- Missing storage
- Corrupt JSON
- Unsupported schema version
- Outdated version migration
- Profile reset
- Preservation of non-health preferences
- Account-free operation

**Step 2: Add the profile schema**

Use the approved `wellnessProfileSchema`. Make all health fields optional except age band, region, diet, allergies, activity, goal, cooking time, budget, and sharing consent.

**Step 3: Implement a generic versioned store**

The store must:

- Use a namespaced key.
- Parse through Zod.
- Migrate known old versions.
- Return defaults when data is unusable.
- Never throw during application startup.
- Expose reset and export methods.
- Avoid health fields in exported analytics events.

**Step 4: Implement profile persistence**

Use browser storage for profile, favorites, saved plans, grocery state, and recipe corrections. Do not store API keys here.

**Step 5: Add the profile provider**

Wrap the application in `ProfileProvider`. Expose profile, update, reset, hydrated, and privacy state through a typed context.

**Step 6: Verify**

```bash
npm test -- test/storage
npm run typecheck
```

Expected: PASS.

**Step 7: Commit**

```bash
git add lib/profile lib/storage components/providers/ProfileProvider.tsx test/storage
git commit -m "feat(profile): add local privacy-first profile storage"
```

---

### Task 6: Implement the Deterministic Weekly Recommendation Engine

**Files:**
- Create: `lib/planner/types.ts`
- Create: `lib/planner/constraints.ts`
- Create: `lib/planner/scoring.ts`
- Create: `lib/planner/weekly-plan.ts`
- Create: `lib/planner/grocery-list.ts`
- Create: `lib/planner/explanations.ts`
- Create: `test/planner/constraints.test.ts`
- Create: `test/planner/weekly-plan.test.ts`
- Create: `test/planner/grocery-list.test.ts`
- Create: `test/planner/golden-profiles.ts`

**Step 1: Write failing hard-constraint tests**

A plan must never include:

- An allergen-tagged ingredient.
- A recipe outside the selected diet.
- A recipe exceeding the selected cooking-time band.
- A recipe missing a required curated nutrition panel.
- A duplicate recipe in the same day unless explicitly requested.

**Step 2: Implement hard filtering before scoring**

Keep safety and dietary constraints separate from preference scoring. A high preference score must never override a failed hard constraint.

**Step 3: Define preference scoring**

Score candidates using explicit, inspectable factors:

- Region match
- District match
- Month/season match
- Available staples
- Goal and comfort preferences
- Spice level
- Cooking time
- Budget
- Ingredient reuse across the week
- Cuisine and category variety

Gender, height, and weight must not produce calorie prescriptions or disease-related scores in version one.

**Step 4: Build the weekly plan**

Generate breakfast, lunch, dinner, and an optional snack for each day. Avoid repeating the same primary ingredient more than the configured limit unless the recipe catalog is too small, in which case report reduced variety.

**Step 5: Add explanations**

Every selected recipe must return structured reasons such as:

```ts
export type PlanExplanation = {
  recipeId: string;
  reasons: string[];
  cautions: string[];
  matchedProfileFields: string[];
};
```

**Step 6: Build the grocery list**

Group ingredients into:

- Staples
- Grains and millets
- Pulses
- Vegetables
- Fruit
- Dairy and alternatives
- Spices and oils
- Animal products
- Other

Merge compatible quantities, retain units, and identify source recipes.

**Step 7: Add golden-plan tests**

Create fixed profiles for:

- Vegetarian Rajasthan
- Vegan Kerala
- Jain Gujarat
- No-onion-garlic Bengal
- Non-vegetarian Punjab
- Low-budget urban household
- Quick-cooking household
- User with multiple allergies

Expected: every golden output is deterministic and passes all constraints.

**Step 8: Verify**

```bash
npm test -- test/planner
npm run typecheck
```

Expected: PASS with no network calls.

**Step 9: Commit**

```bash
git add lib/planner test/planner
git commit -m "feat(planner): add deterministic weekly meal engine"
```

---

### Task 7: Add the Session-Only AI Provider Adapter

**Files:**
- Create: `lib/ai/session.ts`
- Create: `lib/ai/provider.ts`
- Create: `lib/ai/openai-compatible.ts`
- Create: `lib/ai/presets.ts`
- Create: `lib/ai/prompts.ts`
- Create: `lib/ai/schemas.ts`
- Create: `lib/ai/grounding.ts`
- Create: `test/ai/session.test.ts`
- Create: `test/ai/provider.test.ts`
- Create: `test/ai/grounding.test.ts`

**Step 1: Write failing key-handling tests**

Verify:

- Keys are never written to local storage.
- Session keys are removed on expiry, clear action, or tab session end.
- Exported profile data excludes keys.
- Error and telemetry objects never contain authorization headers.
- SSR does not access browser globals.

**Step 2: Define provider configuration**

```ts
export type AiProviderConfig = {
  id: string;
  label: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};
```

Ship presets for one OpenAI-compatible provider and one OpenRouter-compatible preset. Users may add a custom compatible endpoint later only after URL validation and an explicit trust prompt.

**Step 3: Implement direct requests**

Use `fetch` with:

- Authorization header
- JSON content type
- `AbortController`
- Configurable timeout
- No retries that could surprise the user or multiply cost
- No request or response logging

Handle browser C rejection by returning a typed fallback signal.

**Step 4: Ground AI requests**

Send only:

- User-approved profile fields
- A bounded set of curated recipe IDs
- Their compact public summaries
- The user question
- A strict response schema

Do not send the full recipe database, source documents, account data, location history, or excluded health fields.

**Step 5: Validate output**

Use Zod for ranking, substitution, explanation, and conversational suggestions. Reject unknown recipe IDs and invented nutrition values.

**Step 6: Define failure results**

Return a discriminated union:

```ts
export type AiResult<T> =
  | { status: "success"; value: T }
  | { status: "unconfigured" }
  | { status: "timeout" }
  | { status: "invalid-response" }
  | { status: "provider-error"; retryable: boolean }
  | { status: "blocked-by-browser" };
```

**Step 7: Verify**

```bash
npm test -- test/ai
npm run typecheck
```

Expected: PASS without making real provider requests.

**Step 8: Commit**

```bash
git add lib/ai test/ai
git commit -m "feat(ai): add grounded session-only provider adapter"
```

---

### Task 8: Create the App Shell, Design Tokens, and Accessible Navigation

**Files:**
- Modify: `app/globals.css:1-52`
- Modify: `app/layout.tsx:1-41`
- Modify: `components/Providers.tsx`
- Modify: `components/Navbar.tsx:1-113`
- Create: `components/providers/AppProviders.tsx`
- Create: `components/shell/AppShell.tsx`
- Create: `components/shell/MobileNavigation.tsx`
- Create: `components/shell/AiModeIndicator.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Field.tsx`
- Create: `components/ui/Dialog.tsx`
- Create: `components/ui/EmptyState.tsx`
- Create: `components/ui/StatusMessage.tsx`
- Create: `test/shell/navigation.test.tsx`
- Create: `test/shell/mobile-navigation.test.tsx`

**Step 1: Write navigation and accessibility tests**

Cover:

- All primary routes are reachable from desktop and mobile navigation.
- The active route exposes `aria-current="page"`.
- Mobile navigation traps or restores focus as appropriate.
- AI connected/offline status is understandable without color.
- The page has one main landmark and a skip link.

**Step 2: Replace the design tokens**

Implement Living Food Atlas tokens:

- Warm ivory background
- Turmeric accent
- Terracotta action color
- Deep indigo text
- Leaf-green success color
- Muted crop/botanical secondary color
- Editorial display serif
- Highly legible sans-serif UI
- Visible focus treatment
- Reduced-motion media query

Remove the incomplete automatic dark-mode variable override and fixed `bg-white` assumptions. Either implement complete theme tokens or ship one deliberate light theme.

**Step 3: Build the application shell**

Compose:

```tsx
<AppProviders>
  <SkipLink />
  <Navbar />
  <main id="main-content">{children}</main>
  <Footer />
</AppProviders>
```

Remove the nested main landmark from the homepage.

**Step 4: Build responsive navigation**

Use the approved route set. Add a mobile menu with keyboard support, route-aware active state, and a visible AI mode indicator.

**Step 5: Add reusable accessible primitives**

Create consistent button, field, dialog, empty, status, and error components before feature pages. Do not expose raw color or icon-only controls without accessible names.

**Step 6: Verify**

```bash
npm test -- test/shell
npm run lint
npm run typecheck
```

Expected: PASS.

**Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx components test/shell
git commit -m "feat(shell): build accessible Living Food Atlas navigation"
```

---

### Task 9: Rebuild the Homepage Around One Clear Food Intent

**Files:**
- Modify: `app/page.tsx:1-85`
- Create: `components/home/HeroCommand.tsx`
- Create: `components/home/SeasonalStrip.tsx`
- Create: `components/home/RecipeMosaic.tsx`
- Create: `components/home/FoodAtlasPreview.tsx`
- Create: `components/home/CropCalendarPreview.tsx`
- Create: `components/home/TrustSection.tsx`
- Create: `components/home/AiStatusCallout.tsx`
- Create: `test/home/home-page.test.tsx`

**Step 1: Write homepage behavior tests**

Verify:

- The hero contains one clear food command.
- Search works without an API key.
- Weekly planner and recipe discovery CTAs are keyboard accessible.
- Offline mode is stated clearly.
- No unsupported health score or “ancient wisdom” claim appears.
- Homepage has one main landmark.

**Step 2: Implement the hero**

Use the approved line:

> What would you like to nourish today?

Support:

- Ingredient text
- Dish or food text
- Region
- Meal
- Quick “Plan my week” action
- “Explore recipes” action

Without AI, route the query to local recipe search. With AI, offer an explicit “Ask AI” action after the user has configured a key.

**Step 3: Add homepage storytelling sections**

Implement in order:

1. Seasonal foods
2. Personalized weekly planning
3. Regional recipe mosaic
4. Living Food Atlas preview
5. District crop calendar preview
6. Trust and source methodology
7. AI/offline status

**Step 4: Add original or licensed visual assets**

Do not hotlink arbitrary images. Record image origin and usage rights. Provide meaningful alt text and responsive sizes.

**Step 5: Add metadata**

Update title, description, canonical URL, Open Graph data, and structured website data. Avoid medical-result claims.

**Step 6: Verify**

```bash
npm test -- test/home
npm run lint
npm run typecheck
```

Expected: PASS.

**Step 7: Commit**

```bash
git add app/page.tsx components/home test/home
git commit -m "feat(home): launch Living Food Atlas experience"
```

---

### Task 10: Rebuild Regional Recipe Discovery and Recipe Details

**Files:**
- Modify: `app/recipes/page.tsx:1-171`
- Modify: `app/recipes/[slug]/page.tsx:1-435`
- Modify: `lib/content/recipes.ts:1-107`
- Modify: `lib/content/recipe-presentation.ts`
- Create: `components/recipes/RecipeFilters.tsx`
- Create: `components/recipes/RecipeCard.tsx`
- Create: `components/recipes/IngredientMatcher.tsx`
- Create: `components/recipes/NutritionDisclosure.tsx`
- Create: `components/recipes/ProvenancePanel.tsx`
- Create: `components/recipes/SubstitutionList.tsx`
- Create: `test/recipes/discovery.test.tsx`
- Create: `test/recipes/detail.test.tsx`
- Create: `test/recipes/json-ld.test.ts`

**Step 1: Write discovery tests**

Cover filters for:

- State and district
- Month and season
- Diet
- Allergen exclusion
- Cooking time
- Meal category
- Available ingredients
- Budget

**Step 2: Implement local search and filtering**

Use the generated public catalog. No API key or server route may be required.

**Step 3: Improve recipe cards**

Each card shows:

- Dish and region
- Trust label
- Time and cost
- Primary ingredients
- Match reasons
- Save action

**Step 4: Redesign recipe details**

Show:

- Servings and scalable quantities
- Ingredients with allergens
- Method and technique
- Nutrition source and estimate status
- Season and region
- Substitutions
- Provenance and reviewer
- “Add to plan” and “Cook with what I have” actions
- Clear AI-created label when applicable

Do not render `.mdx` as raw HTML. Keep the current safe plain-text rendering unless an MDX compiler and sanitization boundary are deliberately introduced.

**Step 5: Add Recipe JSON-LD**

Only emit values present in the curated record. Never emit fabricated ratings, nutrition, or review counts.

**Step 6: Verify**

```bash
npm test -- test/recipes
npm run build
```

Expected: PASS with no placeholder recipe in static output.

**Step 7: Commit**

```bash
git add app/recipes lib/content components/recipes test/recipes
git commit -m "feat(recipes): add regional discovery and provenance"
```

---

### Task 11: Build the Personalized Weekly Planner

**Files:**
- Create: `app/planner/page.tsx`
- Create: `components/planner/PlannerShell.tsx`
- Create: `components/planner/WeekGrid.tsx`
- Create: `components/planner/MealSlot.tsx`
- Create: `components/planner/PlanControls.tsx`
- Create: `components/planner/ExplanationPanel.tsx`
- Create: `components/planner/GroceryList.tsx`
- Create: `components/planner/OfflineNotice.tsx`
- Create: `test/planner-ui/weekly-plan.test.tsx`
- Create: `test/planner-ui/grocery-list.test.tsx`

**Step 1: Write failing planner UI tests**

Verify:

- Profile completion is required before final plan generation.
- Offline plan generation succeeds.
- Each meal links to a recipe.
- A meal can be replaced without regenerating the full week.
- Allergen exclusions remain active after replacement.
- Grocery items retain units and source recipes.
- AI failure leaves the deterministic plan visible.

**Step 2: Implement the weekly grid**

Use accessible move-left, move-right, remove, and replace controls. Do not add a drag-and-drop dependency unless native controls fail the approved interaction requirements.

**Step 3: Add plan explanations**

Render deterministic reasons before optional AI explanation. Label connected AI explanations separately.

**Step 4: Add grocery grouping**

Render grouped ingredients with checked state persisted locally. Provide print and WhatsApp-share actions.

**Step 5: Add offline behavior**

When no key is configured, show “Smart Offline Mode” and generate immediately. When AI is unavailable, preserve the plan and display a retry action without discarding state.

**Step 6: Verify**

```bash
npm test -- test/planner-ui
npm run typecheck
```

Expected: PASS.

**Step 7: Commit**

```bash
git add app/planner components/planner test/planner-ui
git commit -m "feat(planner): launch weekly personalized meal planning"
```

---

### Task 12: Build Profile, Privacy, Collections, and My Week

**Files:**
- Create: `app/profile/page.tsx`
- Create: `components/profile/ProfileWizard.tsx`
- Create: `components/profile/HealthFields.tsx`
- Create: `components/profile/DietaryPreferences.tsx`
- Create: `components/profile/PrivacyControls.tsx`
- Create: `components/profile/AiConnectionPanel.tsx`
- Create: `app/my-week/page.tsx`
- Create: `components/my-week/MyWeekDashboard.tsx`
- Create: `components/my-week/SavedCollections.tsx`
- Create: `test/profile/profile-wizard.test.tsx`
- Create: `test/profile/privacy.test.tsx`
- Create: `test/my-week/my-week.test.tsx`

**Step 1: Write profile and privacy tests**

Verify:

- Sensitive fields are optional.
- AI sharing defaults to off.
- Excluded fields are absent from the provider payload.
- Reset removes all local profile and collection data.
- Export excludes API keys and hidden health fields by default.
- Validation errors identify the exact field.

**Step 2: Implement the profile wizard**

Use short sections rather than one long form:

1. Location
2. Age and optional body context
3. Activity and goal
4. Diet and allergies
5. Taste, budget, and time
6. Privacy and AI connection

**Step 3: Implement the AI connection panel**

Support:

- Provider selection
- Model selection
- API key entry
- Test connection
- Clear key
- Explanation of session-only storage
- CORS and provider limitations

**Step 4: Build My Week**

Show:

- Current weekly plan
- Saved recipes
- Grocery completion
- Seasonal suggestion
- Offline readiness
- Data export and reset

Do not show a 21-day streak unless the app has a real consecutive-day event model.

**Step 5: Verify**

```bash
npm test -- test/profile test/my-week
```

Expected: PASS.

**Step 6: Commit**

```bash
git add app/profile app/my-week components/profile components/my-week test/profile test/my-week
git commit -m "feat(profile): add local profile and AI privacy controls"
```

---

### Task 13: Build Seasonal Foods, Food Library, and Sources

**Files:**
- Create: `app/seasonal/page.tsx`
- Create: `app/food-library/page.tsx`
- Create: `app/sources/page.tsx`
- Create: `components/seasonal/SeasonalCalendar.tsx`
- Create: `components/seasonal/RegionFestivalContext.tsx`
- Create: `components/library/IngredientDirectory.tsx`
- Create: `components/library/GrainMilletDirectory.tsx`
- Create: `components/library/SpiceDirectory.tsx`
- Create: `components/sources/SourceRegistry.tsx`
- Create: `components/sources/Methodology.tsx`
- Create: `components/sources/CorrectionForm.tsx`
- Create: `content/seasonal/months.json`
- Create: `test/seasonal/seasonal.test.tsx`
- Create: `test/library/food-library.test.tsx`
- Create: `test/sources/sources.test.tsx`

**Step 1: Write tests for source visibility and seasonal accuracy**

Verify that:

- Every displayed factual claim links to a source record or is labeled cultural context.
- Festival content is regional and sourced.
- No medical or “proven science” claim appears without evidence.
- Corrections can be stored locally for later submission.

**Step 2: Build the seasonal calendar**

Use curated month and region data. Weather is contextual only and is not required for the core product.

**Step 3: Build the food library**

Create searchable entries for ingredients, grains, millets, pulses, spices, fats, and cooking techniques. Include regional names and links to recipes and substitutes.

**Step 4: Build Sources and Methodology**

Publish:

- Editorial policy
- Recipe verification levels
- Nutrition estimation policy
- Crop-data coverage policy
- AI limitations
- Privacy behavior
- Correction policy
- Source registry

Replace the existing unsupported science claims rather than moving them unchanged.

**Step 5: Verify**

```bash
npm test -- test/seasonal test/library test/sources
npm run validate:data
```

Expected: PASS.

**Step 6: Commit**

```bash
git add app/seasonal app/food-library app/sources components/seasonal components/library components/sources content/seasonal test
git commit -m "feat(content): add seasonal food library and sources"
```

---

### Task 14: Build the Sow & Eat District Crop Guide

**Files:**
- Create: `app/sow-eat/page.tsx`
- Create: `app/sow-eat/[district]/page.tsx`
- Create: `components/crops/DistrictPicker.tsx`
- Create: `components/crops/IndiaFoodMap.tsx`
- Create: `components/crops/CropCalendar.tsx`
- Create: `components/crops/CropGuidanceCard.tsx`
- Create: `components/crops/CoverageNotice.tsx`
- Create: `test/sow-eat/landing.test.tsx`
- Create: `test/sow-eat/district.test.tsx`

**Step 1: Write failing crop UI tests**

Verify:

- Uncovered districts receive no fabricated recommendation.
- The current month filters crop records.
- Every recommendation shows reasons, cautions, duration, water, and sources.
- Kitchen-garden and small-farm purposes remain distinct.
- The map is not the only way to select a district.

**Step 2: Build an accessible district picker**

Use a searchable native select or list as the source of truth. The map is an optional enhancement.

**Step 3: Build the district view**

Show:

- District coverage status
- Current month
- Suitable crops
- Kitchen-garden crops
- Small-farm crops
- Duration
- Soil and water context
- Source records
- Cautions
- “Find related recipes” action

**Step 4: Add an original schematic map**

Do not copy an unlicensed map asset. Use an original, non- navigational illustration with an accessible text equivalent.

**Step 5: Verify**

```bash
npm test -- test/sow-eat test/crops
npm run build
```

Expected: PASS.

**Step 6: Commit**

```bash
git add app/sow-eat components/crops test/sow-eat
git commit -m "feat(crops): launch district food atlas"
```

---

### Task 15: Build the Grounded AI Kitchen

**Files:**
- Create: `app/ai-kitchen/page.tsx`
- Create: `components/ai-kitchen/AiKitchenShell.tsx`
- Create: `components/ai-kitchen/AskAaharai.tsx`
- Create: `components/ai-kitchen/IngredientSubstitution.tsx`
- Create: `components/ai-kitchen/FoodImageAssist.tsx`
- Create: `components/ai-kitchen/AiDisclosure.tsx`
- Create: `components/ai-kitchen/ManualIngredientFallback.tsx`
- Create: `test/ai-kitchen/ai-kitchen.test.tsx`
- Create: `test/ai-kitchen/food-image-assist.test.tsx`

**Step 1: Write failing AI Kitchen tests**

Verify:

- AI is optional everywhere.
- Questions are grounded in curated candidates.
- Unknown recipe IDs are rejected.
- Image analysis never invents portion size or nutrient values.
- Manual ingredient entry provides the offline alternative.
- Medical red-flag questions stop food advice.
- Provider failures show offline actions.

**Step 2: Implement Ask Aaharai**

Allow:

- Recipe discovery
- Ingredient substitutions
- Method explanations
- Regional variations
- Seasonal meal planning
- “What can I cook with these ingredients?”

Ground every factual response in catalog records or clearly mark suggestions as AI-created.

**Step 3: Implement substitution mode**

Use curated substitute relationships first. AI may suggest a combination but must explain when a substitute is approximate and may change flavor, texture, cooking time, or allergen safety.

**Step 4: Implement image assistance**

Allow users to upload an image only with explicit confirmation. Send it only to the selected provider. Require the user to confirm visible ingredients before planning. Do not calculate nutrition from appearance.

**Step 5: Implement manual offline fallback**

Provide ingredient chips and text entry that use the same local search and planner engine as connected mode.

**Step 6: Verify**

```bash
npm test -- test/ai-kitchen test/ai
```

Expected: PASS without external requests.

**Step 7: Commit**

```bash
git add app/ai-kitchen components/ai-kitchen test/ai-kitchen
git commit -m "feat(ai): add grounded AI food kitchen"
```

---

### Task 16: Add Offline PWA Support and Safe Caching

**Files:**
- Create: `public/sw.js`
- Create: `components/providers/ServiceWorkerRegistration.tsx`
- Create: `app/offline/page.tsx`
- Modify: `app/manifest.ts` or `public/manifest.json`
- Modify: `components/providers/AppProviders.tsx`
- Create: `test/offline/service-worker.test.ts`
- Create: `test/e2e/offline.spec.ts`

**Step 1: Write offline acceptance tests**

Verify:

- A first visit caches the shell, catalog, styles, scripts, and manifest.
- A previously visited recipe and planner route work without network.
- AI provider calls are never cached.
- Authorization headers are never cached.
- The app shows offline mode after network failure.
- Corrupt cached JSON is discarded.

**Step 2: Implement a versioned service worker**

Use a cache version constant. Apply network-first behavior for HTML and stale-while-revalidate for immutable assets and public catalog data. Never cache AI provider requests.

**Step 3: Add install metadata**

Provide name, short name, theme colors, background color, icons, start URL, display mode, and an offline route.

**Step 4: Add an offline route**

Explain that:

- Saved profiles and plans remain available.
- New AI requests require a connection.
- Catalog search and local recommendations continue working.

**Step 5: Verify with Playwright**

```bash
npm run test:e2e -- test/e2e/offline.spec.ts
```

Expected: PASS after one successful online visit.

**Step 6: Commit**

```bash
git add public/sw.js components/providers/ServiceWorkerRegistration.tsx app/offline app/manifest.ts public/manifest.json test/offline test/e2e/offline.spec.ts
git commit -m "feat(offline): add installable Smart Offline Mode"
```

---

### Task 17: Migrate Legacy Routes and Remove the Unused Server Attack Surface

**Files:**
- Create: legacy redirect pages under: `app/prakriti-test/page.tsx`, `app/dashboard/page.tsx`, `app/swapper/page.tsx`, `app/scanner/page.tsx`, `app/dinacharya/page.tsx`, `app/library/page.tsx`, `app/science/page.tsx`
- Delete or retire: `app/nuskhe/page.tsx`
- Delete: `app/api/analyze-food/route.ts`
- Delete: `app/api/swap-food/route.ts`
- Delete: `app/api/nuskhe/route.ts`
- Delete: `app/api/dinacharya/route.ts`
- Delete: `app/api/generate-plan/route.ts`
- Delete: `app/api/ritucharya/route.ts`
- Delete: `app/api/log-food/route.ts`
- Delete: `app/api/save-prakriti/route.ts`
- Delete: `app/api/auth/[...nextauth]/route.ts`
- Delete: `lib/ai.ts`
- Delete: `lib/prisma.ts`
- Delete: `lib/auth/auth-options.ts`
- Delete or archive: `prisma/`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `test/migrations/legacy-routes.test.ts`

**Step 1: Write route migration tests**

Verify every old route returns the intended redirect or retired-feature response and that no legacy public API endpoint remains.

**Step 2: Add compatibility redirects**

Use `permanentRedirect` only where the destination is a true equivalent. Use a temporary redirect or explicit retired-feature page where it is not.

**Step 3: Remove public legacy APIs**

Delete the existing unauthenticated AI proxy routes and the write-only auth/Prisma routes. Keeping them creates an unnecessary attack surface after the frontend-only redesign.

**Step 4: Remove unused backend dependencies**

If no source file references them after migration, remove:

- `next-auth`
- `@next-auth/prisma-adapter`
- `@prisma/client`
- `@prisma/adapter-pg`
- `prisma`
- `dotenv` if it is only transitive

Re-run the production audit after removal.

**Step 5: Preserve future account boundaries**

Keep the AI and profile adapter contracts provider-agnostic. Do not preserve dead authentication code merely for a hypothetical future backend.

**Step 6: Verify**

```bash
npm test -- test/migrations
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
```

Expected: PASS with no public application API routes.

**Step 7: Commit**

```bash
git add app lib prisma package.json package-lock.json test/migrations
git commit -m "refactor: remove legacy server wellness flows"
```

---

### Task 18: Add SEO, Structured Data, Analytics Events, and Performance Budgets

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `components/seo/RecipeJsonLd.tsx`
- Create: `lib/analytics/events.ts`
- Create: `test/analytics/events.test.ts`
- Create: `test/seo/metadata.test.ts`
- Create: `test/seo/json-ld.test.ts`
- Modify: `next.config.ts`
- Create: `lighthouserc.json`

**Step 1: Write privacy and metadata tests**

Verify:

- Events never include profile, health, ingredient, free-text, district, or API-key data.
- Sitemap URLs are valid.
- Recipe JSON-LD contains only sourced values.
- AI-created content is not represented as reviewed community content.

**Step 2: Add a local event boundary**

Define events such as:

- Recipe viewed
- Planner started
- Plan generated
- Offline plan generated
- Recipe saved
- Grocery item checked
- Crop record viewed

Only send events to an external analytics provider after explicit future consent integration. In version one, expose them to local debug tooling only.

**Step 3: Add metadata routes**

Generate sitemap entries for static pages and reviewed recipes. Disallow account-like, AI-key, and irrelevant query URLs in `robots.ts` according to the actual frontend architecture.

**Step 4: Add security and image headers**

Configure a conservative Content Security Policy that supports the selected AI provider endpoint only when a user chooses it. Do not use a wildcard policy. Add frame, referrer, MIME, and permissions headers.

Add remote image patterns only for explicitly approved image hosts.

**Step 5: Add performance budgets**

Set Lighthouse targets:

- Performance: 90+
- Accessibility: 95+
- Best practices: 95+
- SEO: 95+

Set image dimensions, responsive sizes, priorities, and cache behavior during implementation.

**Step 6: Verify**

```bash
npm test -- test/analytics test/seo
npm run build
npx lhci autorun
```

Expected: all configured budgets pass.

**Step 7: Commit**

```bash
git add app/sitemap.ts app/robots.ts components/seo lib/analytics next.config.ts lighthouserc.json test
git commit -m "feat(seo): add privacy-safe discovery and performance gates"
```

---

### Task 19: Add End-to-End Quality Gates and Update Product Documentation

**Files:**
- Create: `test/e2e/onboarding-and-plan.spec.ts`
- Create: `test/e2e/offline-and-recipe.spec.ts`
- Create: `test/e2e/ai-fallback.spec.ts`
- Create: `test/e2e/keyboard-navigation.spec.ts`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md:1-102`
- Create: `docs/content-policy.md`
- Create: `docs/privacy.md`
- Create: `docs/source-review.md`
- Create: `docs/release-checklist.md`

**Step 1: Write core end-to-end tests**

Cover:

1. New visitor completes profile.
2. Offline weekly plan generates.
3. User opens a recipe and adds it to the plan.
4. Grocery list updates.
5. User saves and shares the plan.
6. User disconnects AI and continues working.
7. User configures a mocked AI provider and receives a grounded explanation.
8. Provider failure preserves the deterministic plan.
9. User revisits a cached recipe offline.
10. User resets local data.

**Step 2: Add CI gates**

Run on pull requests:

```bash
npm run lint
npm run typecheck
npm run validate:data
npm test
npm run build
npm audit --omit=dev --audit-level=high
npx playwright test
```

Run Lighthouse and service-worker tests in a separate deterministic job if resource limits make the main matrix unstable.

**Step 3: Rewrite the README**

Document:

- Living Food Atlas positioning
- Smart Offline Mode
- AI setup and session-only key behavior
- Local profile and privacy model
- Content source and review policy
- Crop coverage boundaries
- Scripts and test commands
- No-medical-advice boundary
- Future account/backend adapter path

Remove stale claims about implemented or planned features, hardcoded fallback stats, and OpenRouter server keys.

**Step 4: Add policy documents**

Document:

- What “heritage,” “source-cited,” “community-tested,” and “AI-created” mean
- How corrections are handled
- Which health data is optional
- What leaves the browser
- Why API keys are session-only
- How district crop coverage is verified
- How nutrition values are estimated

**Step 5: Run the release gate**

```bash
npm run check
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

Expected: PASS.

**Step 6: Review the release**

Use `web-design-guidelines`, `accessibility-compliance`, `security-best-practices`, and `verification-before-completion` before launch.

**Step 7: Commit**

```bash
git add test/e2e .github/workflows/ci.yml README.md docs
git commit -m "test: enforce Living Food Atlas release gates"
```

---

## Final Acceptance Checklist

- [ ] No login, database, API route, or API key is required for the core experience.
- [ ] A new user can create a profile and generate a valid weekly plan offline.
- [ ] Allergy and dietary exclusions cannot be bypassed by AI.
- [ ] Every published recipe has reviewed provenance and a valid source policy.
- [ ] No public demonstration recipe remains.
- [ ] Every nutrition value shows source and estimate status.
- [ ] Every crop recommendation has district-month coverage and sources.
- [ ] Missing district data produces an honest coverage response.
- [ ] Connected AI receives only user-approved profile fields and grounded candidates.
- [ ] API keys remain session-only and never enter exports or logs.
- [ ] AI failure never destroys a deterministic plan.
- [ ] Medical red-flag requests stop food advice.
- [ ] All primary routes work with keyboard and at 360px width.
- [ ] Reduced motion, visible focus, and accessible names are present.
- [ ] Offline PWA behavior passes Playwright.
- [ ] Lint, typecheck, content validation, unit tests, build, E2E, audit, and Lighthouse pass.
- [ ] Legacy server APIs and write-only Prisma flows are removed.
- [ ] README and policies match actual behavior.

## Suggested Execution Order

1. Tasks 1-2: tooling and data contracts.
2. Tasks 3-4: curated recipe and crop data.
3. Tasks 5-7: local profile, deterministic planner, and AI adapter.
4. Tasks 8-10: visual system, homepage, and recipe discovery.
5. Tasks 11-15: planner, profile, library, crop guide, and AI Kitchen.
6. Task 16: offline PWA behavior.
7. Task 17: legacy migration and attack-surface reduction.
8. Tasks 18-19: SEO, policy, CI, accessibility, and release verification.

## Execution Handoff

Implementation should begin only after the user explicitly requests it. Use a dedicated worktree, execute tasks in order, review each task’s diff, and do not combine unrelated cleanup into implementation commits.
