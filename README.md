# JBL BIZ LAW | جبل بيز لو

AI-powered legal document analysis, contract review, and business intelligence platform for Saudi professionals.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase Postgres + Drizzle ORM
- **Auth**: Auth.js v5 (NextAuth) with credentials provider
- **Storage**: Cloudflare R2 (S3-compatible)
- **i18n**: next-intl with full Arabic/English bilingual support
- **UI**: TailwindCSS, shadcn/ui, Framer Motion, Radix UI
- **Deployment**: Vercel free tier compatible

## Contents

- `frontend/` - Next.js application (unified frontend + API routes)
- `backend/` - Legacy Express backend (reference only — all routes migrated to `frontend/src/app/api/`)
- `backend/schema.sql` - Original Supabase schema (reference — Drizzle schema at `frontend/src/db/schema.ts`)

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project with Postgres enabled
- A Cloudflare R2 bucket (or any S3-compatible bucket)
- At least one AI provider API key: Anthropic, Google Gemini, or OpenAI
- LibreOffice installed locally (optional, for DOC/DOCX to PDF conversion)

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase DATABASE_URL, AUTH_SECRET, R2 credentials
npm run dev
```

## Database Setup

1. Create or open a Supabase project
2. In Supabase Project Settings > Database, copy a Postgres connection string
3. Use the transaction pooler URL for serverless deployments where possible
4. Copy the connection string to `DATABASE_URL` in `.env.local`
5. Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
6. Run migrations:
```bash
cd frontend
npx drizzle-kit push
```

## Environment Variables

See `frontend/.env.example` for the full list:
- `DATABASE_URL` — Supabase Postgres connection string
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY` — Supabase server-side API access
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Supabase browser client config
- `AUTH_SECRET` — Auth.js secret (generate with `openssl rand -base64 32`)
- `AUTH_URL` — Your app URL (e.g. `http://localhost:3000`)
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` — Cloudflare R2 credentials
- `R2_BUCKET_NAME` — R2 bucket name
- `R2_ENDPOINT` — R2 endpoint URL
- `R2_PUBLIC_URL` — Public URL for R2 files
- `OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` — AI provider keys

## License

AGPL-3.0 — Based on Mike by Will Chen (https://github.com/willchen96/mike)
