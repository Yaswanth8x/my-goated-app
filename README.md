# Polymath OS

Personal academic + professional operating system: **World A (CEG ECE / Anna University)** and **World B (skills, work, career, polymath)**, coordinated without letting professional curiosity consume the degree.

This is a long-term system. The MVP is real architecture + working loops, not a chatbot demo. Several later engines have schema and UI shells; they are not claimed complete.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS v4
- Prisma + SQLite locally (`DATABASE_URL=file:./dev.db`)
- PostgreSQL + pgvector is the production target (see `docs/data-model.md`)
- Provider-agnostic AI (`AI_PROVIDER=mock` or `openai-compatible`)

## Run

Node.js 20+ required. This machine had no Node install; LTS was installed via winget if you followed the same bootstrap.

```bash
cd my-goated-app
copy .env.example .env   # Windows
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

Dev login: `yaswanth@local` / `ceg-ece`

## What is real

- Auth sessions
- Versioned academic profile + curriculum versions (current vs archived)
- Sample 8-semester ECE skeleton totaling ~170 credits **labelled unofficial sample ingest**
- Course dashboards, CO list, academic→professional bridges
- Document upload → chunk → mock embeddings → retrieval
- ECE Professor and Domain Expert chats that **cite retrieved corpus** and refuse to invent university facts in the system prompt
- Custom expert creation from a master prompt
- Freelance readiness matrix (not a fake score)
- Global orchestrator, command bar, search
- Full Prisma schema for PYQ, tests, mastery, CGPA, portfolio, freelance, career, memory layers

## What is mocked / integration-pointed

- AI completions unless `OPENAI_API_KEY` + `AI_PROVIDER=openai-compatible`
- Embeddings (deterministic hash vectors; swap for a real model + pgvector)
- PDF parsing (upload UTF-8 text extracted from PDFs for now)
- YouTube engine (intentionally absent: **no fabricated links**)
- Official Anna University regulation math for CGPA (refuses to assume old tables)
- Exam timer simulator UI (schema exists)

## Safety

No hallucinated regulations, PYQs, videos, guaranteed grades, guaranteed income, or fake portfolio evidence. Cybersecurity and finance experts inherit those constraints in the shared agent safety block.

## Docs

- `docs/architecture.md`
- `docs/data-model.md`
- `docs/agents.md`
- `docs/rag.md`
- `docs/roadmap.md`
