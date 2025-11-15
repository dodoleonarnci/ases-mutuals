## Overview

This repository is a ready-to-deploy starter for the ASES Mutuals webapp:

```
Next.js (frontend UI on Vercel)
      ↓ fetch("/api/*")
Next.js API Routes (serverless functions)
      ↓ Supabase JS client (service role)
Supabase Postgres (students, friendships, matches)
```

The frontend only talks to internal API Routes so secrets stay on the server, while the serverless handlers speak directly to Supabase using typed models and zod validation.

## Requirements

- Node.js **>= 20.9.0** (matches Next.js 16 engine requirement)
- npm 10+ (or pnpm/bun if you prefer)
- Supabase project with the SQL migration applied

## Quickstart

```bash
git clone <repo-url> ases-mutuals
cd ases-mutuals
npm install
cp config/env.example .env.local   # then add your Supabase keys
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the architecture guide page.

## Environment variables

`config/env.example` documents what you need:

```
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="public-anon"
SUPABASE_SERVICE_ROLE_KEY="service-role"

NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon"
```

- `SUPABASE_SERVICE_ROLE_KEY` is **only** used inside API Routes.
- `NEXT_PUBLIC_*` variables are safe to expose to the browser if you later adopt Supabase client-side auth.

## Database schema

`supabase/migrations/0001_init.sql` sets up:

1. `students` – core profile data (`first_name`, `last_name`, `email`, `grad_year`, `major`, `interests` array).
2. `friendships` – requester/addressee pairs with a `friendship_status` enum (`pending`, `accepted`, `rejected`).
3. `matches` – algorithmic pairings, optional link to a friendship, score (0–100) and `match_status` enum (`proposed`, `active`, `inactive`).

Run the migration via the Supabase SQL editor or the CLI:

```bash
supabase db push
```

## API Routes

Located under `src/app/api/*` and automatically deployed as Vercel serverless functions:

| Route | Methods | Description |
| --- | --- | --- |
| `/api/students` | `GET`, `POST` | List students or create a profile. |
| `/api/students/[id]` | `GET` | Fetch a single student by their email handle (e.g. `sunet`). |
| `/api/friendships` | `GET`, `POST` | Manage friendship requests between students. |
| `/api/matches` | `GET`, `POST` | Persist match outcomes with optional friendship linkage. |

Each handler:

- Validates incoming JSON with `zod` (see `src/lib/validators.ts`).
- Uses the Supabase JS client configured with the service role key (see `src/lib/supabase/server.ts`).
- Returns typed JSON responses ready for the React client or external consumers.

### Sample cURL

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ada","last_name":"Lovelace","email":"ada@stanford.edu"}'
```

## Frontend

- `src/app/page.tsx` documents the architecture, endpoints, and migration locations.
- Tailwind CSS is pre-configured via `src/app/globals.css`.
- When you are ready to build UI for matches/friendships, call the API Routes with `fetch("/api/...",{ cache: "no-store" })` to keep data fresh on Vercel.

## Deployment

1. Push to GitHub (or similar).
2. Create a project on Vercel and import the repo.
3. Set the Supabase environment variables in Vercel → Settings → Environment Variables.
4. Trigger a deploy. Vercel will build the frontend and publish the API Routes as serverless functions.

## Troubleshooting

- **Engine mismatch**: upgrade Node.js to at least 20.9.0 locally and in CI/CD; Next.js 16 enforces this.
- **Missing env vars**: `src/lib/env.ts` validates on boot and will crash with a clear error listing the missing keys.
- **Database errors**: API responses return the Supabase error message plus HTTP 500 so you can surface them in logs or client toasts.

You're now ready to extend the UI, add auth, or layer on matching logic without touching the plumbing. Happy building!
