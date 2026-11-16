# docs/data-model.md — Data Model

See DATABASE.md at root for full schema, and prisma/schema.prisma for source of truth.

## Core Principle

Every private user resource has explicit ownership via user_id FK + RLS.

## Tables

- profiles (user_id FK auth.users)
- semesters (1-8)
- courses (code, name, semester_id)
- units (course_id, number)
- topics (unit_id)
- course_outcomes (course_id, code)
- documents (user_id, course_id, bucket, path)
- document_chunks (document_id, user_id, course_id, embedding vector)
- conversations (user_id, course_id, expert_id)
- messages (conversation_id, user_id, role, content, citations)
- memories (user_id, course_id, expert_id, type, key, content)
- ai_providers (user_id, provider, api_key_encrypted)
- ai_usage (user_id, provider, model, tokens, cost)
- model_registry (provider, model_id, display_name, capabilities, cost_class)
- pyqs, tests, skills, experts, projects, portfolio, freelance, goals, cgpa

## Indexes

On user_id, course_id, created_at, plus composite.

## RLS

See supabase/migrations/001_initial_schema_rls.sql

## Storage Buckets

documents (private), avatars (public), project-assets, portfolio, course-materials (private) with RLS by user_id folder.

## Production Target

PostgreSQL + pgvector extension for embeddings: CREATE EXTENSION vector; embedding vector(1536)
