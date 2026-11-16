# PART 7 — Map Existing API Routes

**Date:** 2026-09-26
**Workspace 1 Part 7**

## WHAT WE ARE BUILDING
Mapping existing API routes.

## CURRENT STATE

- No `src/app/api/` folder (empty)
- No `pages/api/` folder
- No route.ts files
- No server actions
- `package.json` has no API-related dependencies beyond Next.js

**Conclusion:** API Routes = 0% implemented.

## TARGET API ROUTES (from 125 spec)

### Core (Workspace 1)
```
GET  /api/health                    // Health check
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/profile
PUT  /api/profile
POST /api/storage/upload           // Generic upload
GET  /api/storage/buckets
```

### AI (Workspace 2)
```
POST /api/chat                     // Send message, get streaming response
  Body: { conversation_id, course_id, expert_id, provider, model, messages, teaching_mode }
  Returns: Streaming text/event-stream

GET  /api/conversations            // List conversations for user
POST /api/conversations            // Create new conversation
GET  /api/conversations/:id
DELETE /api/conversations/:id
GET  /api/conversations/:id/messages
POST /api/conversations/:id/messages

GET  /api/ai/providers             // List configured providers
POST /api/ai/providers             // Save provider key (server-only)
DELETE /api/ai/providers/:id
GET  /api/ai/models                // Model registry
GET  /api/ai/usage                 // Usage tracking
POST /api/ai/router                // Test router selection

POST /api/documents/upload         // Upload doc
POST /api/documents/:id/chunk      // Trigger chunking
POST /api/documents/:id/embed      // Trigger embedding
GET  /api/documents                // List docs
GET  /api/documents/:id
DELETE /api/documents/:id
POST /api/rag/retrieve             // Test retrieval
```

### Academic (Workspace 3)
```
GET  /api/academics/semesters
GET  /api/academics/courses
GET  /api/academics/courses/:id
GET  /api/academics/courses/:id/units
GET  /api/academics/courses/:id/cos
POST /api/pyq/upload
GET  /api/pyq
GET  /api/pyq/frequency
POST /api/tests/generate
POST /api/tests/:id/submit
GET  /api/mastery
GET  /api/cgpa/calculate
```

### Professional (Workspace 4)
```
GET  /api/skills
GET  /api/experts
POST /api/experts                  // Custom expert creation
POST /api/experts/:id/chat
GET  /api/projects
POST /api/projects
GET  /api/portfolio
POST /api/portfolio
GET  /api/freelance/services
POST /api/freelance/leads
```

### Polymath (Workspace 5)
```
GET  /api/orchestrator/next       // "What should I do next?"
GET  /api/analytics
GET  /api/search?q=...
GET  /api/notifications
POST /api/backup/export
GET  /api/admin/health            // Admin only
```

### Design Principles
- **Validation:** Use zod for all request bodies
- **Auth:** Every private route checks `const { data: { user } } = await supabase.auth.getUser()` and returns 401 if not
- **Ownership:** Check `user_id` matches resource's `user_id`, return 403 if not
- **Error Format:**
```json
{
  "error": {
    "what": "Document not found",
    "why": "No document with id xyz for user abc",
    "what_to_do": "Check document list at /documents or upload new"
  }
}
```
Not just "Something went wrong"

- **Streaming:** For chat, use `new ReadableStream` with `text/event-stream`
- **File Upload:** Validate type, size, scan

### What Should Be Preserved
- Nothing to preserve, but keep Next.js route handler convention: `route.ts` exports GET, POST, etc.

### What Should Be Created First (Part 14-15 onwards)
- `src/app/api/health/route.ts` (simple health check, no auth)
- `src/app/api/chat/route.ts` (mock provider first)
- Incrementally add others

## TEST
- After Part 14, `GET /api/health` should return `{ status: "ok" }`
- After Part 19, protected routes should return 401 when not logged in

## STATUS
✅ Mapped — API Routes 0% implemented, target defined with ~30 endpoints.

