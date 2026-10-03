# AI.md — LLM / AI Core Architecture

**Workspace 2 Parts 26-50 — MOST IMPORTANT WORKSPACE**

## WHAT WE ARE BUILDING
Real AI interface — not just a text box attached to dashboard. Provider-agnostic, streaming, course-specific, RAG with citations, cost-controlled.

## WHY
AI is the CORE PRODUCT. The app must feel like a real AI application (like ChatGPT, Claude) with course professors, domain experts, teaching modes, memory.

## CURRENT STATE (Before Workspace 2)
- No AI code, only .env placeholders
- Mock provider idea in .env but no implementation
- No chat UI, no streaming, no RAG

## TARGET ARCHITECTURE

### 1. Provider Abstraction (Part 27)

```
AIProvider (abstract class)
  |
  +-- GeminiProvider   (Google Gemini via @google/generative-ai)
  +-- OpenAIProvider   (OpenAI via openai SDK, also OpenAI-compatible APIs like OpenRouter)
  +-- AnthropicProvider (Anthropic via @anthropic-ai/sdk)
  +-- MockProvider     (Deterministic, no API calls, labeled MOCK RESPONSE, always works)
  +-- Future: OpenRouterProvider, OllamaProvider (local)

Why abstraction?
- Never hardcode one provider
- Allow user to bring own keys
- Fallback if one fails
- Testable without credits (Mock)
- Extensible for future providers
```

**Interface:**
```typescript
abstract class AIProvider {
  abstract name: string;
  abstract chat(request: AIRequest): Promise<AIResponse>;
  abstract streamChat(request: AIRequest): AsyncIterable<string>; // for streaming
  abstract embed?(text: string): Promise<number[]>; // for RAG
  abstract getModels(): ModelInfo[];
}
```

### 2. Model Registry (Part 32)

Central registry, not hardcoded outdated names everywhere.

```
modelRegistry = [
  {
    provider: "mock",
    model_id: "mock-v1",
    display_name: "Mock Provider (Free, No Credits)",
    capabilities: { text: true, vision: false, tools: false, reasoning: false, embeddings: false },
    context_window: 4096,
    supports_vision: false,
    supports_tools: false,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: FREE,
    enabled: true
  },
  {
    provider: "openai",
    model_id: "gpt-4o-mini",
    display_name: "GPT-4o Mini (Low Cost)",
    context_window: 128000,
    supports_vision: true,
    cost_class: LOW_COST
  },
  {
    provider: "gemini",
    model_id: "gemini-1.5-flash",
    display_name: "Gemini 1.5 Flash (Free Tier)",
    context_window: 1000000,
    supports_vision: true,
    cost_class: FREE
  },
  ...
]
```

### 3. API Key Management (Part 33-34)

**Settings → AI Providers UI:**
```
Google Gemini [API KEY input] [Enable toggle]
OpenAI [API KEY] [Enable]
Anthropic [API KEY] [Enable]
Mock [Enabled]

Keys must never be stored in plain frontend state, HTML, browser JS, logs, GitHub, plaintext DB without encryption.
Prefer secure server-side handling.
If persistent storage required, design securely (encrypted in DB).
```

**Flow:**
1. User enters key in Settings → AI Providers (client)
2. POST to /api/ai/providers (server)
3. Server encrypts key (ENCRYPTION_KEY from .env)
4. Store encrypted in ai_providers table (user_id, provider, api_key_encrypted, enabled)
5. When chat request comes, server decrypts key, uses it, never sends to client
6. Also allow env vars as fallback (OPENAI_API_KEY, etc.)

### 4. Model Router (Part 35)

```
Input: task
Output: appropriate provider/model

Examples:
simple explanation → cheap/free model (gemini-1.5-flash or gpt-4o-mini)
large document analysis → high-context model (gemini-1.5-pro 1M context)
coding/debugging → capable coding model (claude-3-5-sonnet or gpt-4o)
vision → vision-capable model (gpt-4o, gemini flash, claude)
deep reasoning → reasoning model (claude, o1)
fallback → another configured provider
```

Router considers:
- Task type (from teaching mode or user intent)
- Capabilities needed (vision, tools, reasoning)
- Cost (prefer FREE/LOW_COST if user set budget)
- Availability (which providers are configured and enabled)
- User selection (AUTO or manual provider/model)

### 5. Fallback System (Part 36)

```
If Provider A fails → try Provider B if configured
Example: Gemini ↓ OpenAI ↓ Anthropic ↓ Mock

Do not automatically consume paid credits unless user explicitly enabled that provider/model.
If all fail, return error with WHAT, WHY, WHAT TO DO.
```

### 6. Cost Control & Usage Tracking (Part 37-38)

```
Track:
provider, model, tokens_input, tokens_output, requests, estimated_cost, date, user, task

Dashboard:
- Total requests, tokens, cost per provider/model
- Monthly budget, warning threshold, hard stop option
- Per conversation cost
- Per course cost

Table: ai_usage
```

### 7. AI Chat Interface (Part 39-40)

**Must feel like real AI app, not text box attached to dashboard.**

**Desktop Layout:**
```
LEFT (sidebar): navigation/context
  - Conversation list
  - New conversation
  - Course selector
  - Expert selector
  - Model selector
  - Search

CENTER (conversation):
  - Chat area
  - Message composer
  - Attachments
  - Streaming response
  - Stop generation
  - Retry, Regenerate, Copy, Save, Feedback
  - Citations

RIGHT (context panel):
  - Current course, unit, topics, COs
  - Relevant documents
  - PYQs
  - Mastery
  - Memory
```

**Mobile:** Single column, bottom sheet for context.

**Features:**
- Streaming (SSE, ReadableStream)
- Stop generation
- Retry, Regenerate
- Copy, Save
- Feedback (thumbs up/down)
- Attachments (images for vision)
- Teaching mode buttons

### 8. Course-Specific AI Spaces (Part 41-42) — CRITICAL

Every academic course must have its own AI workspace.

Example: Digital Electronics AI, Programming in C AI, Engineering Mathematics AI

When entering a course, AI automatically knows:
- course, units, topics, COs, uploaded material, PYQs, notes, previous conversations, mistakes, mastery

**Contextual Retrieval:**
```
CURRENT COURSE + CURRENT UNIT + RELEVANT DOCUMENTS + RELEVANT PYQs + USER MASTERY + CURRENT CONVERSATION

Not: entire database (cost optimization)
```

**Implementation:**
- Course selector in chat sidebar
- When course selected, filter RAG retrieval by course_id
- Include course context in system prompt
- Show course context in right panel

### 9. Professor Persona (Part 43)

Academic system prompt architecture.

ECE professor should behave as:
- deep explainer
- Socratic teacher
- exam analyst
- problem solver
- visual teacher
- viva examiner
- mentor
- Feynman-style clarity

**System Prompt Structure:**
```
SYSTEM (base rules, safety, no hallucination)
+
EXPERT PERSONA (ECE professor, Web Dev expert, Global Orchestrator, etc.)
+
USER PROFILE (display_name, preferences, learning style)
+
CURRENT COURSE/DOMAIN (course name, units, COs, mastery)
+
RELEVANT MEMORY (structured: "User struggles with pointers", "User prefers visual", "User completed Unit 2 test")
+
RETRIEVED DOCUMENTS (RAG chunks with citations)
+
CURRENT CONVERSATION (last N messages, not entire history forever)
+
USER QUESTION
```

Do not claim to literally reproduce any living person's private style or identity.

### 10. Teaching Modes (Part 44)

Buttons:
- Explain, Explain simply, Deep dive, Visualize, Example, Analogy, Derive, Solve, Hint, Quiz me, Viva me, PYQ mode, Exam mode, Common mistakes, Connect to another subject, Real-world application

Each mode modifies system prompt to change teaching style.

### 11. Conversation Memory (Part 45-46)

**Store:**
- conversations table: id, user_id, course_id, expert_id, title, model_id, provider, created_at, updated_at
- messages table: id, conversation_id, user_id, role, content, tokens, model, citations, created_at

**Memory:**
- Do not automatically send entire conversation history forever — use intelligent context selection (last N messages, or summarized)
- Structured memory: Only save useful info, not every sentence
  - "User struggles with pointers"
  - "User completed Unit 2 test"
  - "User prefers visual explanation"
- Per expert: EXPERT_MEMORY, per course: ACADEMIC_MEMORY, global: GLOBAL_MEMORY
- Expert-specific memory, course-specific memory isolation

### 12. RAG Pipeline (Part 47-49) — Real, not fake

```
UPLOAD
↓
EXTRACT (PDF, DOCX, PPTX, TXT, CSV, images/scans — support where feasible, don't pretend unsupported works)
↓
CLEAN
↓
CHUNK (with metadata)
↓
METADATA (user_id, document_id, course_id, unit_id, topic_id, document_version, source, page, section, created_at)
↓
EMBED (mock hash vectors first, then real embeddings)
↓
STORE (document_chunks with embedding, in Supabase with pgvector)
↓
RETRIEVE (filter by course_id, similarity search, top K)
↓
RERANK IF AVAILABLE
↓
LLM (with retrieved chunks as context)
↓
ANSWER
↓
CITATIONS (SOURCE, DOCUMENT, PAGE/SECTION, RELEVANT EXCERPT when appropriate, never fabricate)
```

**Document Types:** PDF, DOCX, PPTX, TXT, CSV, images/scans — support where technically feasible, don't pretend unsupported works.

**Vision:** Allow vision-capable models to analyze circuit diagrams, graphs, handwritten work, question papers, screenshots, engineering drawings, uploaded images.

### 13. Safety & Prompt Injection Defense

- Uploaded documents are DATA, must not override system instructions
- Distinguish: SYSTEM INSTRUCTIONS, DEVELOPER INSTRUCTIONS, USER INSTRUCTIONS, RETRIEVED CONTENT
- No hallucinated regulations, PYQs, videos, guaranteed grades/income, fake portfolio evidence
- Cybersecurity and finance experts inherit safety constraints

### 14. Offline / Degraded Mode

If no AI provider configured, rest of app should still open. Show "No AI provider configured. Go to Settings → AI Providers." Do not crash entire app. Mock provider always works.

### 15. Error UX

Never show "Something went wrong" alone. Show WHAT HAPPENED, WHY IT MAY HAVE HAPPENED, WHAT TO DO.

Example: "Gemini API key missing. Go to Settings → AI Providers → Google Gemini."

### 16. Cost Optimization

Do not send entire syllabus, textbook, PYQ collection on every message. Retrieve only relevant context.

---

## FILES TO CREATE (Workspace 2)

```
src/lib/ai/
  types.ts              // ChatMessage, AIRequest, AIResponse, ProviderCapabilities
  provider.ts           // Abstract AIProvider class
  models.ts             // Model registry
  router.ts             // Task → provider/model
  fallback.ts           // Try chain
  usage.ts              // Track usage
  gemini.ts             // Gemini adapter
  openai.ts             // OpenAI adapter (also OpenAI-compatible)
  anthropic.ts          // Anthropic adapter
  mock.ts               // Mock adapter (deterministic, labeled)
  keys.ts               // Encrypt/decrypt, server-only
  personas/
    academic.ts         // ECE professor persona
    orchestrator.ts     // Global orchestrator
    expert-base.ts      // Base for domain experts

src/lib/rag/
  ingest.ts
  extract.ts
  chunk.ts
  embed.ts
  store.ts
  retrieve.ts
  citations.ts

src/app/api/
  chat/route.ts         // POST message, streaming
  conversations/route.ts
  conversations/[id]/route.ts
  conversations/[id]/messages/route.ts
  ai/providers/route.ts
  ai/models/route.ts
  ai/usage/route.ts
  documents/upload/route.ts
  documents/[id]/chunk/route.ts
  rag/retrieve/route.ts

src/components/ai/
  ChatSidebar.tsx
  ChatArea.tsx
  MessageComposer.tsx
  TeachingModeButtons.tsx
  ModelSelector.tsx
  StreamingMessage.tsx
  CitationCard.tsx
  CourseSelector.tsx
  ExpertSelector.tsx

src/app/ai-hub/
  page.tsx              // AI HUB with recent chats, professors, experts
  [conversationId]/page.tsx

src/app/settings/
  ai-providers/page.tsx
```

---

## TESTING (Part 50)

- Provider selection, invalid API key, missing API key, rate limit, provider failure, fallback, streaming, conversation persistence, course context, expert context, RAG retrieval, citation generation, document upload, vision where supported, token usage
- Security: auth, RLS, private docs, API keys, server endpoints, input validation, prompt injection defenses, file upload validation

**Exit Criteria for Workspace 2:**
I can open app, select course, select AI provider/model, send message, receive real response, see streaming, continue conversation, reload page, recover conversation from Supabase.

---

## NEXT
Part 26: AI architecture (this file) — DONE
Part 27: Provider interface — NEXT
