# Aaharai 🌿

> Make India Healthy Again — with Ancient Wisdom and AI.

Aaharai is an Ayurvedic AI wellness assistant. It pairs classical Ayurvedic
principles (prakriti, dinacharya, ritucharya) with AI via OpenRouter to turn
everyday food choices into personalized, seasonal guidance.

## Features

- **Prakriti Quiz** (`/prakriti-test`) — determine your Vata / Pitta / Kapha
  constitution; the result is saved to your user profile.
- **Dashboard** (`/dashboard`) — 21-day Satvik challenge streak, points,
  recent activity feed, and live seasonal wisdom.
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
| UI extras | framer-motion, lucide-react |

## Getting Started

Prerequisites: Node.js 20+, a PostgreSQL database, a Google OAuth client
(Web application), and an OpenRouter API key.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```
3. Generate the Prisma client and sync the schema to your dev database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the dev server and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## Environment Variables

Mirrors `.env.example` — never commit real values.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma (`prisma.config.ts`) |
| `NEXTAUTH_SECRET` | Secret used by next-auth to sign/encrypt session tokens |
| `NEXTAUTH_URL` | Canonical app URL; read internally by next-auth (needed beyond localhost) |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `OPENROUTER_API_KEY` | OpenRouter API key powering the AI routes |
| `NEXT_PUBLIC_SITE_URL` | Public base URL sent to OpenRouter as HTTP-Referer |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Roadmap

### Verified-Regional-Authenticity Recipes (planned)

A curated recipe section where authenticity is a first-class, verifiable
property rather than a marketing claim:

- **Region & dialect tagging** — e.g. Bengali vs Marathi takes on the same dish.
- **Lineage attribution** — whose kitchen, family tradition, or classical text
  a recipe traces back to.
- **Verification badges** — community-reviewed, expert-reviewed, source-cited.
- **Content-as-code** — recipes authored as MDX in this repo, reviewed via PRs,
  rendered statically.

## Known Gaps

- `prisma/migrations/` is not yet committed; schema changes currently rely on
  `prisma db push`.
- The dashboard shows hardcoded fallback stats (points/streak/sample activity)
  when there is no real log data available.
