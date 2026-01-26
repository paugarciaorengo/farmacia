# Copilot / AI agent instructions for this repository

Purpose: help AI coding agents be immediately productive in this Next.js + Prisma codebase.

- **Big picture**: This is a Next.js App Router project rooted at `src/app`. Server code (API route handlers) lives under `src/app/api/*`. The database layer is Prisma (`prisma/schema.prisma`) with the client singleton in `src/lib/prisma.ts` to avoid duplicate clients in dev. Authentication uses NextAuth defined in `src/auth.ts` and wired into global middleware via `src/middleware.ts`.

- **Key files to read first**:
  - [src/app/api/products/route.ts](src/app/api/products/route.ts#L1-L200) — canonical API route patterns (GET list + POST create).
  - [src/app/api/media/[id]/route.ts](src/app/api/media/[id]/route.ts#L1-L200) — example of `formData()` usage, `auth()` usage, and `revalidatePath()` cache invalidation.
  - [prisma/schema.prisma](prisma/schema.prisma) — DB model shapes and important constraints (StockLot.expiresAt required, unique indexes).
  - [src/lib/prisma.ts](src/lib/prisma.ts) — Prisma singleton pattern used in this repo.
  - [src/auth.ts](src/auth.ts) and [src/middleware.ts](src/middleware.ts) — auth implementation and route matching.

- **API route conventions**:
  - Routes export HTTP method functions: `export async function GET(...)`, `POST(...)`, etc. Use `NextRequest` / `NextResponse` from `next/server`.
  - Use the `auth()` helper (from `src/auth.ts`) inside handlers to get session; check `session.user.role` for authorization (common checks: `ADMIN` or `PHARMACIST`).
  - For form submissions that include files or multi-part data, handlers use `await req.formData()` (see media route).
  - After DB changes that affect pages, call `revalidatePath()` from `next/cache` to avoid stale UI (see media route which revalidates admin edit/gallery pages).

- **Database / migrations / seed**:
  - Migrations live under `prisma/migrations`. The repo uses Prisma 6.x. The seed script is declared in `package.json`'s `prisma.seed` property and runs via `npx prisma db seed`.
  - Use the singleton in `src/lib/prisma.ts` when importing Prisma in server code: `import { prisma } from '@/src/lib/prisma'`.

- **Run / build / common commands** (from `package.json`):
```bash
# dev server
npm run dev
# build
npm run build
# start
npm run start
# lint
npm run lint
# Prisma seed (uses prisma.seed from package.json)
npx prisma db seed
# Apply dev migrations
npx prisma migrate dev
```

- **Project-specific patterns & gotchas**:
  - Prefer server components (app router) unless a component has `"use client"` — `src/app/components/MaskLayout.tsx` is an explicit client example.
  - Avoid creating new PrismaClient instances; always import the shared `prisma` from `src/lib/prisma.ts`.
  - Authentication uses JWT sessions (`session.strategy = "jwt"`) — `auth()` returns session data suitable for server handlers.
  - Many API handlers return JSON via `NextResponse.json(...)` and use `NextResponse.redirect(..., 303)` for form POST redirects.
  - The `Media` model stores image `url` values; file storage is handled externally (URLs saved in DB).

- **Code style & tooling**:
  - TypeScript is used across the codebase. Run `npm run lint` for linting.
  - Tailwind is configured; look at `globals.css` in `src/app` for the main styles.

- **Where to change behavior**:
  - To alter auth rules, update `src/auth.ts` (credentials provider & session callbacks).
  - To change DB queries or model shapes, update `prisma/schema.prisma`, create a migration (`npx prisma migrate dev`), and update server code that consumes models.

If anything in these points is unclear or you want more detail (examples for tests, CI, or deployment), say which area to expand and I'll iterate.
