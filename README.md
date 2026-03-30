# CMD — Command Center

Turborepo monorepo with a Next.js dashboard app (Chat, Life, Business, Admin), Clerk auth, Drizzle + Neon, and shared packages.

## Setup

```bash
pnpm install
```

### Environment

- **Dashboard:** Create `apps/dashboard/.env.local` with:
  - `DATABASE_URL` — Neon Postgres connection string
  - Clerk keys: `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, etc.

### Database

Push the Drizzle schema to Neon (from repo root, with env loaded from the dashboard):

```bash
cd packages/db && set -a && source ../../apps/dashboard/.env.local && set +a && pnpm db:push
```

Or from root with turbo: ensure `DATABASE_URL` is in your environment, then:

```bash
pnpm db:push
```

## Development

- **Default (recommended, lighter on memory):**  
  `pnpm dev` — starts the dashboard with a memory cap and no Turbopack.

- **Faster dev (Turbopack, more resource-heavy):**  
  `pnpm dev:turbo`

Open [http://localhost:3000](http://localhost:3000). Sign-in/sign-up use Clerk.

## Build & typecheck

```bash
pnpm run typecheck
pnpm run build
```

## Production

- **Node:** 20+ (see `engines` in root `package.json`).
- **Build:** `pnpm run build` produces the dashboard app (with Next.js `standalone` output for lean deploys).
- **Run:** After building, `pnpm start` serves the dashboard (or run `pnpm start` from `apps/dashboard`). Set `DATABASE_URL` and Clerk env vars in the environment.

## Deploy / build in the cloud

See [docs/DEPLOY.md](docs/DEPLOY.md) for Vercel and GitHub Actions.

## Structure

- `apps/dashboard` — Next.js 16 app (Clerk, tabs: Chat, Life, Business, Admin)
- `packages/db` — Drizzle schema + Neon client
- `packages/auth` — Role-based tab access
- `packages/ui` — Shared UI primitives
- `packages/types` — Shared TypeScript types
