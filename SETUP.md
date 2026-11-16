# SETUP.md — Beginner-Friendly Setup Guide

**Workspace 1 Part 13**

This guide is for someone who knows almost nothing about programming. Follow step by step.

---

## WHAT WE ARE BUILDING
We are setting up Polymath OS — your personal CEG ECE + AI Professor + Skills + Career operating system.

## WHY
So you can run the app on your own computer, connect Supabase, and start using AI.

---

## PREREQUISITES

### 1. Install Node.js (Required)
Node.js is JavaScript runtime that lets us run the app.

- **Windows/Mac/Linux:** Go to https://nodejs.org → Download LTS (Long Term Support) → Install
- **Check:** Open terminal/command prompt, run:
```bash
node --version
npm --version
```
You should see versions like `v20.x` and `10.x`.

### 2. Install Git (Required)
Git is version control that lets us clone code.

- **Windows:** https://git-scm.com/download/win → Install
- **Mac:** `xcode-select --install` or https://git-scm.com/download/mac
- **Linux:** `sudo apt install git` (Ubuntu) or equivalent
- **Check:**
```bash
git --version
```

### 3. Create Supabase Project (For Database, Auth, Storage)
Supabase is our backend — it gives us PostgreSQL, Auth, Storage, RLS.

1. Go to https://supabase.com → Sign Up (free)
2. Click "New Project"
3. Name: `polymath-os` (or any)
4. Set database password (save it!)
5. Choose region closest to you (e.g., Mumbai for Chennai)
6. Wait 2-3 minutes for project to be ready
7. Go to Project → Settings → API
8. Copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (SECRET, never expose to browser)
9. Also get DATABASE_URL: Settings → Database → Connection string → URI (use password you set)

---

## INSTALLATION STEPS

### Step 1: Clone Repository
```bash
git clone https://github.com/Yaswanth8x/my-goated-app.git
cd my-goated-app
```

If you are on this branch `arena/01a0dd70-my-goated-app`:
```bash
git checkout arena/01a0dd70-my-goated-app
```

### Step 2: Install Dependencies
```bash
npm install
```
This installs Next.js, React, Supabase, Prisma, etc. Takes 1-2 minutes.

**What you should see:** No errors, or only warnings. If you see `added 400 packages`, success.

**If fails:** See TROUBLESHOOTING.md

### Step 3: Create Environment Variables
```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

Now edit `.env` file (use Notepad, VS Code, or any text editor):

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
AUTH_SECRET="generate-random-32-chars-here"
ENCRYPTION_KEY="generate-32-char-key-here"
```

**How to generate AUTH_SECRET:**
- Linux/Mac: `openssl rand -base64 32`
- Or use https://generate-secret.vercel.app/32
- Or just type random letters/numbers, at least 32 chars

**For local dev without Supabase:** Keep `DATABASE_URL="file:./dev.db"` and leave Supabase keys empty — app will run in mock mode (login with `yaswanth@local / ceg-ece`)

### Step 4: Setup Database (If Supabase configured)

#### Option A: Prisma (Recommended for now)
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

**What you should see:**
- `Prisma schema loaded`
- `Database synchronized`
- `Seeding complete!` with semesters, courses, skills, experts

**If `npx prisma generate` fails with network error:** This is known issue in some sandboxes. You can skip and use Supabase SQL editor directly (Option B). App will still boot, but DB features will be limited until you run migrations in Supabase.

#### Option B: Supabase SQL Editor (If Prisma fails)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema_rls.sql`
3. Paste and Run
4. Then manually create tables via Prisma or SQL

#### Option C: Mock Mode (No DB)
- Keep `DATABASE_URL=file:./dev.db`
- App boots with mock auth
- Real persistence will not work, but UI works

### Step 5: Start Development Server
```bash
npm run dev
```

**What you should see:**
```
▲ Next.js 16.3.6
- Local: http://localhost:3000
- Environments: .env
✓ Ready in 2s
```

### Step 6: Open Browser
Open http://localhost:3000

You should see Polymath OS dashboard with:
- Sidebar: HOME, ACADEMICS, SKILLS, PROJECTS, PORTFOLIO, FREELANCING, CAREER, DOCUMENTS, AI HUB, ANALYTICS, SETTINGS
- Hero: "Polymath OS"
- Status: "Workspace 1 — Core Repair In Progress"

### Step 7: Test Auth
- Go to http://localhost:3000/login
- If Supabase configured: Sign up with your email, then login
- If mock mode: Use `yaswanth@local / ceg-ece` → should login and show mock user

### Step 8: Test API
Open http://localhost:3000/api/health

You should see:
```json
{
  "status": "ok",
  "workspace": "Workspace 1 - Core Repair",
  "checks": { ... }
}
```

---

## WHAT FILES ARE INVOLVED

- `.env` — your secrets (never commit to GitHub, .gitignore blocks it)
- `.env.example` — example template, safe to commit
- `src/lib/env.ts` — central env access
- `src/lib/validation.ts` — validates env with zod
- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client
- `src/lib/supabase/admin.ts` — service role client (server only)
- `prisma/schema.prisma` — database schema
- `supabase/migrations/001...sql` — RLS policies

---

## HOW TO TEST IT

1. **Build test:**
```bash
npm run build
```
Should say "Compiled successfully" and list routes.

2. **Auth test:**
- Login → should redirect to home
- Check Settings → should show user ID and email

3. **RLS test (when Supabase configured):**
- Create two users, try to read each other's documents — should return 0 rows

---

## WHAT TO DO IF IT FAILS

See TROUBLESHOOTING.md, but common:

- **"Couldn't find any pages or app directory"** — you are on old branch, checkout latest, ensure `src/app/` exists
- **"next: not found"** — run `npm install`
- **Prisma network error** — skip, use mock mode or Supabase SQL editor
- **Supabase not configured warning** — set env vars or use mock login
- **Port 3000 in use** — run `npm run dev -- -p 3001` and open http://localhost:3001

---

## NEXT STEPS

- Workspace 1 Part 14-25: Supabase integration, RLS, auth, storage, error logging
- Workspace 2: AI chat with streaming, RAG, citations
- Read ARCHITECTURE.md for target architecture
- Read DATABASE.md for schema
- Read PROJECT_AUDIT.md for what was broken

---

## BEGINNER TIPS

- **Don't edit .env.example** — edit .env
- **Never share .env** — it has secrets
- **If stuck, say "FIX"** — the agent will inspect errors
- **Commit often:** `git add . && git commit -m "my checkpoint"`
- **To stop dev server:** Ctrl+C in terminal
