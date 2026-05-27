# Clone And Launch JBL BIZ LAW From Mike

Use Mike as upstream reference, but keep JBL as your own fork/workspace.

Source Mike repo verified: `https://github.com/willchen96/mike`

Current JBL origin: `https://github.com/jbx22/JBL.git`

## Correct Git Setup

For a clean machine:

```bash
git clone https://github.com/jbx22/JBL.git jbl-biz-law
cd jbl-biz-law
git remote add upstream https://github.com/willchen96/mike.git
git fetch upstream
```

For the existing local workspace:

```bash
cd D:\AI\openclaw\.openclaw\workspace\jbl-biz-law
git remote -v
git remote add upstream https://github.com/willchen96/mike.git
git fetch upstream
```

If `upstream` already exists, use:

```bash
git remote set-url upstream https://github.com/willchen96/mike.git
git fetch upstream
```

## Branch Rule

Keep `main` as the stable JBL line. Do not do big OpenClaw experiments directly on `main`.

Use one task branch at a time:

```bash
git checkout main
git pull origin main
git checkout -b task/short-clear-name
```

Examples:

```bash
git checkout -b task/fix-chat-wiring
git checkout -b task/arabic-rtl-polish
git checkout -b task/r2-upload-port
```

When the task is done:

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
git status
git add .
git commit -m "Fix chat wiring"
git push -u origin task/fix-chat-wiring
```

Then merge through GitHub or ask OpenClaw to review and merge.

## Launch Locally

Install dependencies:

```bash
cd D:\AI\openclaw\.openclaw\workspace\jbl-biz-law\frontend
npm install
```

Create local environment:

```bash
copy .env.local.example .env.local
```

If `.env.local.example` is missing, copy from the repo root `.env.example` and adjust names as needed.

Required values:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`
- at least one AI key: `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `ANTHROPIC_API_KEY`

Generate an auth secret:

```bash
npx auth secret
```

Use the Supabase Postgres connection string for `DATABASE_URL`, preferably the transaction pooler URL for serverless deployments. Then push the Drizzle schema to Supabase:

```bash
npm run db:push
```

Start the app:

```bash
npm run dev
```

Open:

`http://localhost:3000`

## Wiring From Mike To JBL

Mike originally uses:

- Supabase Auth and Postgres
- Express backend routes
- frontend calls into backend APIs
- S3-compatible storage

JBL should use:

- Auth.js / NextAuth for auth
- Supabase Postgres with Drizzle for database
- Next.js API routes under `frontend/src/app/api`
- Cloudflare R2 for storage
- next-intl for Arabic and English UI

When porting a Mike feature, follow this order:

1. Find the original Mike UI flow.
2. Find the backend endpoint it calls.
3. Recreate the endpoint as a Next.js route under `frontend/src/app/api`.
4. Replace Supabase calls with Drizzle queries.
5. Replace Supabase auth checks with `requireAuth`.
6. Replace Supabase file storage with R2 helpers.
7. Keep the UI behavior the same unless JBL branding or Arabic support requires a change.
8. Run lint and build before marking the task finished.

## What Not To Do

- Do not reclone Mike over the JBL workspace.
- Do not create many parallel branches for the same feature.
- Do not mix unrelated tasks in one branch.
- Do not delete the AGPL license or Mike attribution.
- Do not move admin or super-admin back into the main dashboard navigation.
