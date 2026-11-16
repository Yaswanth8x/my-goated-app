# docs/architecture.md — Detailed Architecture

This is a more detailed version of ARCHITECTURE.md at root, for docs folder as mentioned in old README.

## High-Level

See root ARCHITECTURE.md for diagrams.

## Key Decisions

- **Next.js App Router** — Server Components by default, client only when needed (chat, auth)
- **Supabase** — PostgreSQL + Auth + Storage + RLS + Realtime + pgvector
- **Prisma** — ORM that can target SQLite locally and PostgreSQL in production (Supabase)
- **Provider-agnostic AI** — Never hardcode one provider, Mock always works
- **Tailwind v4** — Utility-first CSS
- **zod** — Validation for env and API

## Folder Structure

See ARCHITECTURE.md root for full structure.

## Security

- RLS on all private tables
- Server-only for secrets
- Encrypted API keys
- Input validation
- Prompt injection defense

## Performance

- Pagination, lazy loading, server-side retrieval, caching
- Don't send entire syllabus on every message — retrieve only relevant context
- Streaming for AI

## Accessibility

- Keyboard nav, labels, contrast, focus states, semantic HTML

## Deployment

- Vercel + Supabase + Provider APIs
- Feature flags
- Dev/prod envs
