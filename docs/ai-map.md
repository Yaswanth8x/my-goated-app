# PART 8 — Map Existing AI-Related Code

**Date:** 2026-09-26
**Workspace 1 Part 8**

## WHAT WE ARE BUILDING
Mapping existing AI code.

## CURRENT STATE

**Search for AI files:**
- No `src/lib/ai/` folder content (we created empty placeholder)
- No provider files
- No model registry
- No chat UI
- No RAG code
- No embeddings
- No `OPENAI_API_KEY` usage in code (only in .env)
- No Gemini, Anthropic code

**.env says:**
```
AI_PROVIDER="mock"
OPENAI_API_KEY=""
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"
```

**package.json:**
- No AI SDKs: no `openai`, no `@google/generative-ai`, no `@anthropic-ai/sdk`
- Only `zod`, `lucide-react`, `next`, `react`, `prisma`

**Conclusion:** AI = 0% implemented. Only env placeholders.

## TARGET AI ARCHITECTURE (from 125 spec — MOST IMPORTANT WORKSPACE)

### Core Principle: PROVIDER-AGNOSTIC
Never hardcode one provider.

```
AIProvider (abstract)
  |
  +-- GeminiProvider
  +-- OpenAIProvider
  +-- AnthropicProvider
  +-- MockProvider (required, labeled MOCK RESPONSE)
  +-- Future: OpenRouterProvider, OllamaProvider
```

### Files to Create (Workspace 2)

#### 1. Types & Interface
```
src/lib/ai/types.ts
  - ChatMessage { role, content, timestamp }
  - AIRequest { messages, course, unit, expert, teaching_mode, model, provider, attachments }
  - AIResponse { content, citations, usage, model }
  - ProviderCapabilities { vision, tools, reasoning, embeddings, context_window }

src/lib/ai/provider.ts
  - abstract class AIProvider
    - abstract chat(request): Promise<AIResponse>
    - abstract streamChat(request): AsyncIterable<string>
    - abstract embed(text): Promise<number[]>
    - getModelList()
```

#### 2. Adapters
```
src/lib/ai/gemini.ts      // Google Gemini via @google/generative-ai
src/lib/ai/openai.ts      // OpenAI via openai SDK
src/lib/ai/anthropic.ts   // Anthropic via @anthropic-ai/sdk
src/lib/ai/mock.ts        // Deterministic mock, no API calls, clearly labeled
```

#### 3. Model Registry
```
src/lib/ai/models.ts
  - modelRegistry: array of {
      provider, model_id, display_name, capabilities, context_window,
      supports_vision, supports_tools, supports_reasoning, supports_embeddings,
      cost_class: FREE/LOW_COST/PREMIUM, enabled
    }
  - No hardcoded outdated names everywhere — central registry
  - Configurable via env or DB
```

#### 4. Router & Fallback
```
src/lib/ai/router.ts
  - selectModel(task): { provider, model }
    - simple explanation → cheap/free
    - large doc analysis → high-context
    - coding/debugging → capable coding model
    - vision → vision-capable
    - deep reasoning → reasoning model
    - fallback → next configured provider

src/lib/ai/fallback.ts
  - tryProviderChain([gemini, openai, anthropic, mock])
  - If Provider A fails, try B, if configured
  - Never auto-consume paid credits unless user enabled that provider
```

#### 5. Settings & Key Management
```
src/app/settings/ai-providers/page.tsx
  UI:
    Google Gemini [API KEY input] [Enable toggle]
    OpenAI [API KEY] [Enable]
    Anthropic [API KEY] [Enable]
    Mock [Enabled]

src/lib/ai/keys.ts
  - Server-only handling
  - Never store in frontend state, HTML, browser JS, logs, GitHub, plaintext DB without encryption
  - Prefer: Encrypted in DB or env, accessed via server route
```

#### 6. Usage & Cost Control
```
src/lib/ai/usage.ts
  - track: provider, model, tokens, requests, cost, date, user, task

src/app/api/ai/usage/route.ts
  - GET usage dashboard

src/components/ai/CostControl.tsx
  - monthly budget, warning threshold, hard stop option
```

#### 7. Chat UI (Core Product)
```
src/components/ai/
  ChatSidebar.tsx         // conversation list, new conversation, course selector, expert selector
  ChatArea.tsx            // messages, citations
  MessageComposer.tsx      // input, attachments, model selector, teaching modes
  TeachingModeButtons.tsx // Explain, Simply, Deep dive, Visualize, Example, Analogy, Derive, Solve, Hint, Quiz, Viva, PYQ mode, Exam mode, Mistakes, Connect, Real-world
  ModelSelector.tsx
  StreamingMessage.tsx

src/app/ai-hub/page.tsx
  - RECENT CHATS, COURSE PROFESSORS, PROFESSIONAL EXPERTS, NEW CHAT, NEW EXPERT, RECENT DOCS, CURRENT LEARNING CONTEXT
```

#### 8. Course-Specific AI Spaces (CRITICAL)
```
When entering course:
  AI automatically knows:
    course, units, topics, COs, uploaded material, PYQs, notes, previous conversations, mistakes, mastery

Context Retrieval:
  CURRENT COURSE + CURRENT UNIT + RELEVANT DOCUMENTS + RELEVANT PYQs + USER MASTERY + CURRENT CONVERSATION

Not: entire DB
```

#### 9. Professor Persona
```
src/lib/ai/personas/
  academic.ts             // ECE professor: deep explainer, Socratic, exam analyst, problem solver, visual teacher, viva examiner, mentor, Feynman clarity
  global-orchestrator.ts  // Coordination, not teaching
  expert-base.ts          // Base for domain experts
  web-dev.ts, etc.

System prompt architecture:
  SYSTEM + EXPERT PERSONA + USER PROFILE + CURRENT COURSE/DOMAIN + RELEVANT MEMORY + RETRIEVED DOCUMENTS + CURRENT CONVERSATION + USER QUESTION
```

#### 10. RAG Pipeline (Real, not fake)
```
UPLOAD → EXTRACT → CLEAN → CHUNK → METADATA → EMBED → STORE → RETRIEVE → RERANK → LLM → ANSWER → CITATIONS

src/lib/rag/
  ingest.ts               // Upload handler
  extract.ts              // PDF/DOCX/PPTX/TXT/CSV/images extraction
  chunk.ts                // Chunking with metadata
  embed.ts                // Mock hash vectors first, then real embeddings
  store.ts                // Store in document_chunks with pgvector
  retrieve.ts             // Similarity search + course filter
  citations.ts            // Build citations with SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT

Metadata per chunk:
  user_id, document_id, course_id, unit_id, topic_id, document_version, source, page, section, created_at
```

#### 11. Safety
```
- Uploaded docs are DATA, not instructions — must not override system instructions
- Distinguish: SYSTEM, DEVELOPER, USER, RETRIEVED CONTENT
- Prompt injection defense
- No hallucinated regulations, PYQs, videos, guaranteed grades/income
```

### What Should Be Preserved
- `AI_PROVIDER=mock` idea — keep, mock provider is required for testing without credits
- `OPENAI_BASE_URL` — keep for OpenAI-compatible APIs (OpenRouter, local)

### What Should Be Created First
- `src/lib/ai/types.ts`
- `src/lib/ai/provider.ts`
- `src/lib/ai/mock.ts` (first, so app works without keys)
- `src/lib/ai/models.ts`

### TEST (Workspace 2)
- Provider selection, invalid API key, missing key, rate limit, provider failure, fallback, streaming, conversation persistence, course context, expert context, RAG retrieval, citation generation, document upload, vision, token usage

## STATUS
✅ Mapped — AI 0% implemented, target architecture defined with provider abstraction, model registry, router, fallback, RAG pipeline, safety.

