# START HERE — Polymath OS, explained simply

You said: *"many changes were made and I understand nothing."*

That is not your fault. This repo contained documents saying **"125/125 parts — 100% complete — production ready"** while large parts of the app were still demo screens. If the app tells you it is finished, of course you cannot tell what is real.

This file is the honest version. Read only this file first. Everything else can wait.

---

## 1. What this app is supposed to be

One place for a CEG ECE student that combines:

- your syllabus (semesters, courses, units, topics)
- an AI professor you can ask questions
- previous year questions (PYQ) analysis and mock tests
- your notes and uploaded files
- skills, projects, portfolio, freelancing, career

It is built with **Next.js** (the website framework), **TypeScript** (JavaScript with type checking), and it is *designed* for **Supabase** (a hosted database + login + file storage).

---

## 2. The single most important thing to know

**Right now the app runs in DEMO MODE.**

| What | Status | What that means for you |
|---|---|---|
| Website pages | **REAL** | 23 pages open, no crashes |
| Automated tests | **REAL** | 73 tests, all passing |
| Academic maths (CGPA, PYQ, tests) | **REAL** | Real calculations, tested |
| RAG pipeline (upload → answer with citations) | **REAL code, memory-only storage** | Works end-to-end, but forgets everything when the server restarts |
| Login | **MOCK** | Only `yaswanth@local` / `ceg-ece`. No real accounts |
| Database | **MOCK** | Saves to your browser, not to a server |
| AI answers | **MOCK** | Clearly labelled `MOCK RESPONSE`. No real AI until you add a key |
| File upload | **MOCK** | File details are saved; the actual file is not stored |
| Skills / Projects / Portfolio / Freelancing / Career | **SAMPLE SCREENS** | Pretty, but not connected to a database |
| PDF reading | **MISSING** | Real PDFs are rejected. Upload `.txt`, `.csv` or `.md` |

So: **the engine is real, the data layer is not.** That is the sentence that explains this whole project.

---

## 3. Why you could not understand it

Four reasons, all fixable:

1. **Too many markdown files.** There were 15 `.md` files, several claiming completion. You did not know which to trust.
2. **The app itself claimed "100%".** The sidebar said `125/125 COMPLETE` and `Production ready`. I have replaced that with an honest `DEMO MODE` badge.
3. **No tests existed.** So no one — including the previous work — could prove anything worked.
4. **Nothing was committed.** The entire `src/` folder was untracked in Git, so you could not see what changed or undo it.

---

## 4. How to run it (copy-paste, one line at a time)

Open a terminal in the project folder.

```bash
npm install
```
Downloads the libraries. Takes ~1 minute. Safe to re-run.

```bash
npm run dev
```
Starts the app in development mode. You will see `Local: http://localhost:3000`. Open that in your browser.

**Login:** click Login and use
- email: `yaswanth@local`
- password: `ceg-ece`

If the page does not load, run `npm run build` first and read the error — it names the exact file and line.

To stop the server, press `Ctrl + C`.

---

## 5. How to check it is healthy

```bash
npm test
```

Expected output ends with:

```
# tests 73
# pass 73
# fail 0
```

If any test fails, **do not continue** — that is a real bug and the test names tell you which part.

```bash
npm run build
```

Expected: `✓ Compiled successfully` and a list of 23 routes. This is the step that catches broken pages.

```bash
npm run verify
```

Runs both, one after the other. This is your gate before trusting any change.

You can also open `http://localhost:3000/api/health` in the browser. It now reports the truth:

```json
"mode": "mock",
"database": { "state": "mock", "detail": "Supabase not configured ..." }
```

---

## 6. What I fixed in this session

These were real defects, each one found by testing rather than guessing.

| # | Problem | Why it mattered | Fixed |
|---|---|---|---|
| 1 | Next.js 16 route params used the old synchronous style in 3 pages | Pages crashed with *"params is a Promise and must be unwrapped"* | Yes |
| 2 | Chat stream text was silently dropped when a network chunk split a JSON line | Answers appeared to randomly lose words | Yes |
| 3 | Chat error messages were written to state that was immediately cleared | Failures showed nothing at all | Yes |
| 4 | Storage path accepted a hostile `folder_id` like `../../other-user` | **Security hole** — could write outside your own folder | Yes |
| 5 | AI router always picked the free Mock provider, even with a real key configured | You would pay for a key and still get mock answers | Yes |
| 6 | `generateQuestionsFromFamilies(families, 3)` returned 1 question | Practice sets were short | Yes |
| 7 | 10 of 31 courses had no units | Their Unit tabs were empty | Yes |
| 8 | Missing file / malformed JSON returned HTTP **500** | Looked like the server was broken; clients could not tell what they did wrong | Now 400 with a clear message |
| 9 | `/api/health` reported "database: pending, auth: pending" | The health check itself was out of date and misleading | Now reports real config |
| 10 | No tests and no `test` script existed | Nothing could be verified | 73 tests added |
| 11 | UI claimed "125/125 COMPLETE — No fake" | Directly caused your confusion | Replaced with honest status |

---

## 7. What is still NOT done (do not let anyone tell you otherwise)

Listed by value, highest first.

### A. Connect Supabase (biggest win)
Without it: no real accounts, no real database, no real file storage, and the security policies in `supabase/migrations/` have **never been executed**.

Steps:
1. Create a project at supabase.com.
2. Copy `.env.example` to `.env`.
3. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`.
4. Run the SQL files in `supabase/migrations/` in the Supabase SQL editor.
5. Create a private storage bucket named `workspaces`.
6. Restart the app and check `/api/health` — `database` should change from `mock` to `configured`.

**Never** put `SUPABASE_SERVICE_ROLE_KEY` or any AI key in a `NEXT_PUBLIC_` variable. Those are visible to every visitor.

### B. Make PDFs actually readable
This is the one that hurts your real use case, because your syllabus and PYQ files are PDFs.

Current state: `.txt`, `.csv`, `.md` work. A real PDF returns
*"PDF parsing not fully implemented"*.

I tried the common library `pdf-parse` and **removed it again**: it failed on valid PDFs under Node 22 (`bad XRef entry`). Shipping it would have been a fake fix. The correct next step is a modern extractor (`pdfjs-dist` legacy build) plus tests against 3 real PDFs — budget a few hours, not a few minutes.

### C. Wire the Workspace 4–5 screens to the database
Skills, Projects, Portfolio, Freelancing, Career and Analytics currently render sample data. They are not lies exactly — they are placeholders — but nothing you type there is saved.

### D. The curriculum is a sample
31 courses, ~170 credits, marked `R2021` and explicitly labelled *"unofficial sample"* in the code. It is **not** the official Anna University CEG ECE syllabus. If you have the official PDF, that needs a proper import step.

---

## 8. Where things live (map)

```
src/app/            one folder = one page (URL)
  academics/        semester and course pages
  ai-hub/           chat screen
  workspaces/       file/notes areas
  api/              server endpoints (chat, upload, health)
src/lib/            the actual logic ("the engine")
  academic/         curriculum, CGPA, mastery, PYQ, tests
  rag/              chunk, embed, retrieve, citations
  ai/               providers, model registry, router, fallback
  workspace/        files, notes, storage
  supabase/         database/login clients
tests/              73 automated tests  <-- added this session
supabase/           database schema and security policies
prisma/             alternative database schema
```

Rule of thumb: **pages show things, `src/lib` does things.** When something is wrong, the bug is almost always in `src/lib`.

---

## 9. Plain-English glossary

| Word | Plain meaning |
|---|---|
| **Next.js / App Router** | The framework that turns folders in `src/app` into web pages |
| **TypeScript** | JavaScript with types, so mistakes are caught before running |
| **Supabase** | A hosted service giving you database + login + file storage |
| **RLS** | Database rule that stops user A reading user B's rows |
| **Migration** | A SQL file that creates tables and rules |
| **RAG** | Look up your documents first, then answer using them |
| **Citation** | Proof of which document/page an answer came from |
| **Embedding** | Turning text into numbers so similar text can be found |
| **Mock** | A stand-in that behaves predictably without a real service |
| **Mock mode** | Running without keys, using stand-ins |
| **Router (AI)** | Chooses which AI provider/model handles a request |
| **Fallback** | If provider 1 fails, try provider 2, then 3, then mock |
| **Test** | A small program that checks one behaviour automatically |
| **Build** | The step that proves every page compiles |

---

## 10. What to do next — one step only

1. Run `npm install`, then `npm run verify`. Confirm **73 tests pass** and the build succeeds.
2. Run `npm run dev`, log in with the mock account, click every page in the sidebar.
3. Decide which matters more to you:
   - **Real accounts and saved data** → do section 7A (Supabase)
   - **Reading your syllabus PDFs** → do section 7B (PDF extraction)

Do not start both at once. That is how the previous "125 parts" turned into something nobody could follow.

When you pick one, say which, and I will do only that and prove it with tests before moving on.
