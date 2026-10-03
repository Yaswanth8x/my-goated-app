# TROUBLESHOOTING.md — Common Errors & Fixes

**Workspace 1 Part 24**

## Build Errors

### Error: Couldn't find any `pages` or `app` directory
**What happened:** Next.js needs `app/` or `pages/` folder. Old repo had none.
**Why:** You are on old commit or `src/app/` was deleted.
**What to do:**
```bash
git status
ls src/app
# If missing, checkout latest:
git checkout arena/01a0dd70-my-goated-app
git pull
# Or recreate structure:
mkdir -p src/app
# Then create at least src/app/layout.tsx and src/app/page.tsx
```

### Error: sh: 1: next: not found
**What:** `node_modules` not installed.
**Fix:**
```bash
npm install
```

### Error: Cannot find module '@/components/...'
**What:** Path alias broken or file missing.
**Fix:** Check `tsconfig.json` has `"@/*": ["./src/*"]` and file exists in `src/`.

## Prisma Errors

### Error: Could not find Prisma Schema
**What:** No `prisma/schema.prisma`
**Fix:** Ensure file exists, check `prisma/` folder.

### Error: request to https://binaries.prisma.sh/... failed
**What:** Network blocked, can't download Prisma engine.
**Why:** Sandbox or firewall blocks binaries.prisma.sh
**What to do:**
- Try again: `npx prisma generate`
- Try with no engine: `npx prisma generate --no-engine` (if supported)
- Or skip for now: App boots without Prisma client if you don't import it in app code. Use Supabase SQL editor to run migrations manually.
- Or use `DATABASE_URL=file:./dev.db` and change provider to sqlite temporarily for local dev.

### Error: Can't reach database server at ...
**What:** DATABASE_URL wrong or Supabase not reachable.
**Fix:**
- Check DATABASE_URL in .env
- For Supabase: Should be `postgresql://postgres:password@db.project.supabase.co:5432/postgres`
- Check password correct
- Check Supabase project is running (not paused)
- Try connecting via Supabase Dashboard → SQL Editor

## Supabase Errors

### Warning: Supabase not configured — mock mode
**What:** `NEXT_PUBLIC_SUPABASE_URL` or `ANON_KEY` missing.
**Fix:**
- Set them in .env from Supabase Dashboard → Settings → API
- Or use mock login: `yaswanth@local / ceg-ece` at /login

### Error: Invalid API key
**What:** Supabase keys wrong.
**Fix:** Copy again from dashboard, ensure no extra spaces, no quotes issue.

### Error: auth.uid() returns null, RLS blocks everything
**What:** Session not refreshed, middleware not working.
**Fix:**
- Check `middleware.ts` exists and is at root
- Check `src/lib/supabase/server.ts` creates client with cookies
- Try logout/login again
- Check browser cookies enabled

## Auth Errors

### Error: Email not confirmed
**What:** Supabase requires email confirmation by default.
**Fix:**
- Go to Supabase Dashboard → Authentication → Providers → Email → Disable "Confirm email" for dev
- Or check email inbox for confirmation link

### Mock login not working
**What:** Using `yaswanth@local / ceg-ece` but still fails.
**Fix:**
- Ensure Supabase NOT configured (if configured, mock disabled)
- Check `src/components/auth/AuthProvider.tsx` has mock logic
- Clear browser storage and try again

## AI Errors

### Error: No AI provider configured
**What:** No OPENAI_API_KEY, GEMINI_API_KEY, etc.
**Fix:**
- This is expected in Workspace 1. Real AI comes in Workspace 2.
- For now, Mock provider always works and is labeled "MOCK RESPONSE"
- Configure keys in .env or Settings → AI Providers (Workspace 2)

## Dev Server Errors

### Port 3000 in use
**What:** Another process using 3000.
**Fix:**
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Or run on different port
npm run dev -- -p 3001
```

### Changes not showing
**What:** Browser cache.
**Fix:** Hard refresh Ctrl+Shift+R, or stop and restart dev server.

## Environment Errors

### Error: AUTH_SECRET must be at least 16 chars
**What:** `AUTH_SECRET` too short.
**Fix:** Generate random 32+ chars: `openssl rand -base64 32` or use https://generate-secret.vercel.app/32

### .env not loaded
**What:** Next.js not reading .env
**Fix:**
- Ensure .env at root (same folder as package.json)
- Restart dev server after editing .env
- Check .env.example for required vars

## Git Errors

### Error: failed to push, authentication failed
**What:** GitHub auth needed.
**Fix:** In Arena, GitHub is already configured via `gh` CLI. Try `git push origin arena/01a0dd70-my-goated-app`. If fails, tell user GitHub connection needs reconnect in Arena UI.

### Merge conflicts
**What:** Two people edited same file.
**Fix:**
```bash
git status
# Edit conflicted files, remove <<<<< ===== >>>>>
git add .
git commit -m "resolve conflict"
```

## How to Ask for Help

When you say "FIX", provide:
1. What command you ran
2. Full error output
3. What you expected
4. Your .env (without secrets!) — e.g., show if Supabase URL set or not, but not the key

Example:
```
I ran npm run build and got:
Error: Cannot find module '@/lib/supabase/client'
I expected build to succeed.
My NEXT_PUBLIC_SUPABASE_URL is set (not showing key).
```

## Still Stuck?

- Read SETUP.md again step by step
- Check PROJECT_AUDIT.md for known broken areas
- Check HEALTH_REPORT.md for current status
- Say "STATUS" to get current completed parts
- Say "EXPLAIN" to get architecture explained like to 10-year-old
