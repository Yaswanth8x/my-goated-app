# PART 4 — Map Existing Frontend

**Date:** 2026-09-26
**Workspace 1 Part 4**

## WHAT WE ARE BUILDING
We are mapping what frontend code exists today.

## WHY
So we know what to keep, repair, or rebuild. Beginner must see clearly what is missing.

## CURRENT STATE (What exists)

**Files found:**
- No `app/` folder
- No `src/app/` folder (we just created empty placeholder)
- No `components/` folder (empty placeholder)
- No `pages/` folder
- No `src/components/` code
- No layout, no pages, no UI

**Package.json says:**
- Next.js 16.3.6 (App Router)
- React 19.2.8
- Tailwind CSS v4
- lucide-react icons

**tsconfig.json says:**
- Path alias `@/* -> ./src/*` but src was missing (now we created empty)

**Conclusion:** Frontend = 0% implemented.

## TARGET FRONTEND (What we need for 125-part spec)

### Folder Structure (App Router)
```
src/
  app/
    layout.tsx          // Root layout, providers, nav
    page.tsx            // HOME dashboard
    globals.css         // Tailwind
    (auth)/
      login/page.tsx
      signup/page.tsx
    academics/
      page.tsx
      [semesterId]/page.tsx
      [semesterId]/[courseId]/page.tsx
    skills/
      page.tsx
      [skillId]/page.tsx
    projects/
      page.tsx
    portfolio/
      page.tsx
    freelancing/
      page.tsx
    career/
      page.tsx
    documents/
      page.tsx
    ai-hub/
      page.tsx
      [conversationId]/page.tsx
    analytics/
      page.tsx
    settings/
      page.tsx
      ai-providers/page.tsx
    api/
      chat/route.ts
      documents/route.ts
      etc.
  components/
    ui/                 // Button, Card, Input, etc.
    layout/             // Sidebar, Header, Navigation
    academic/           // CourseCard, UnitList, COMastery
    ai/                 // ChatMessage, ChatSidebar, ModelSelector, TeachingModes
    skills/             // SkillCard, ExpertCard
    projects/           // ProjectCard, PortfolioCard
  lib/
    supabase/
      client.ts         // Browser client
      server.ts         // Server client
      admin.ts          // Service role
    ai/
      provider.ts       // Abstract interface
      models.ts         // Model registry
      router.ts         // Router
      gemini.ts, openai.ts, anthropic.ts, mock.ts
    rag/
      chunk.ts, embed.ts, retrieve.ts
    utils.ts
  types/
    database.ts
    ai.ts
    academic.ts
```

### Key UI Requirements (from spec)
- **Main Navigation:** HOME, ACADEMICS, SKILLS, PROJECTS, PORTFOLIO, FREELANCING, CAREER, DOCUMENTS, AI HUB, ANALYTICS, SETTINGS
- **AI Chat Layout:** Desktop = LEFT navigation/context, CENTER conversation, RIGHT context panel. Mobile = single column.
- **Course Page Priority:** AI Professor, Current topic, Continue learning, PYQs, Practice, Mastery — NOT decorative cards
- **Design Principle:** FUNCTION > DECORATION
- **Mobile Responsive:** Must work on desktop, tablet, mobile. AI chat especially usable on mobile.
- **Accessibility:** keyboard nav, labels, contrast, focus states, semantic HTML

### State Management
- **Server Components** by default (Next.js 16)
- **React Context** for user/session, course context, AI settings
- **Supabase Realtime** only where useful (AI generation status, notifications)

### What Should Be Preserved
- Tailwind v4 choice — keep
- lucide-react icons — keep
- Path alias `@/*` — keep, now that src exists

### What Should Be Refactored/Created
- Create `src/app/layout.tsx` with root layout
- Create `src/app/globals.css` with Tailwind
- Create `src/app/page.tsx` with HOME
- Create navigation component
- Create UI primitives

## TEST
- Check that `src/app` folder exists (we created placeholder)
- After Part 11, we will have real files and `npm run build` should pass

## STATUS
✅ Mapped — Frontend is 0% implemented, target defined.

