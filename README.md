# agdlawai | Arabic Mike

**AI-powered legal document analysis, contract review, and business intelligence platform for Saudi professionals.**

This is the complete, consolidated project — backend + frontend + docs + agent identity — all in one place. It serves as **Arabic Mike**, the unified agent workspace for the JBL BIZ LAW project.

> Built on [Mike](https://github.com/willchen96/mike) by Will Chen · AGPL-3.0

---

## Architecture

| Layer | Stack |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Database** | Supabase Postgres + Drizzle ORM |
| **Auth** | Auth.js v5 (NextAuth) + credentials provider |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **i18n** | next-intl (Arabic/English bilingual) |
| **UI** | TailwindCSS, shadcn/ui, Framer Motion, Radix UI |
| **Deployment** | Vercel free tier compatible |

## Contents

```
agdlawai/
├── backend/          # Express backend (reference — routes migrated to frontend)
│   ├── src/          #   lib, middleware, routes
│   └── schema.sql    #   Original Supabase schema
├── frontend/         # Next.js app — unified frontend + API routes
│   └── src/
├── docs/             # Project documentation & workflow guides
├── scripts/          # Build/generation utilities
├── AGENTS.md         # Agent workspace instructions
├── BOOTSTRAP.md      # First-run bootstrap (delete after setup)
├── HEARTBEAT.md      # Periodic automation tasks
├── IDENTITY.md       # Agent name, nature, vibe, emoji
├── SOUL.md           # Core personality & boundaries
├── TOOLS.md          # Local tool configuration
├── USER.md           # Human profile & preferences
├── .openclaw/        # OpenClaw workspace state
├── PROMPT.txt        # Session prompt / migration instructions
├── .env.example      # Environment variable template
└── README.md         # You are here
```

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

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | Supabase server-side API access |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase browser client config |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `R2_*` | Cloudflare R2 credentials & bucket |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` | AI provider keys |

## License

AGPL-3.0

---

*Formerly at `jbl-biz-law/agent` and `JBL/`. Everything is now consolidated here.*
