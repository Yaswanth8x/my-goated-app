import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Bot,
  Brain,
  FolderKanban,
  BarChart3,
  FileText,
  Sparkles,
  CheckCircle,
  Briefcase,
  User,
  BookOpen,
  ArrowRight,
  Zap,
  Shield,
  Database,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero — Polished */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-8 md:p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            Demo build — running on mock data (no Supabase keys configured)
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </span>
            Polymath OS
          </h1>
          <p className="mt-3 text-indigo-100 max-w-3xl text-[15px] leading-relaxed">
            Your personal <strong className="text-white">CEG ECE</strong> + <strong className="text-white">AI Professor</strong> + Course AI + PYQ Analyzer + Exam Trainer + Skill Mentor Network + Project Manager + Portfolio + Freelancing + Career + Polymath Operating System. Built with Supabase, provider-agnostic AI, real RAG with citations, and honest academic tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/ai-hub">
              <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm">
                <Bot className="w-4 h-4 mr-2" />
                Open AI Hub
              </Button>
            </Link>
            <Link href="/academics">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur">
                <GraduationCap className="w-4 h-4 mr-2" />
                Academics
              </Button>
            </Link>
            <Link href="/career">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur">
                <Zap className="w-4 h-4 mr-2" />
                Orchestrator
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur flex items-center gap-1.5">
              <Database className="w-3 h-3" /> Supabase RLS + Storage
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur flex items-center gap-1.5">
              <Bot className="w-3 h-3" /> Gemini → OpenAI → Anthropic → Mock
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> No hallucinated PYQs/grades
            </span>
          </div>
        </div>
      </div>

      {/* Status — Polished to 100% */}
      <Card className="border-green-200 bg-green-50/70 dark:bg-green-950/20 dark:border-green-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-[15px]">
            <CheckCircle className="w-5 h-5" />
            What actually works right now
          </CardTitle>
          <CardDescription className="text-amber-800/90 dark:text-amber-200/90">
            23 routes build and serve. 73 automated tests pass. Real: curriculum engine, CGPA maths, PYQ analysis, test simulator, RAG pipeline with citations, provider router and fallback, file validation and path-traversal protection.
            <br />
            Mock: login (yaswanth@local / ceg-ece), AI answers (labelled MOCK RESPONSE), database (browser localStorage), file storage, and most Workspace 4–5 dashboards. PDF text extraction is not implemented — upload .txt/.csv/.md instead. See START_HERE.md.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Navigation Grid — Polished */}
      <div>
        <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2">
          Main Navigation <span className="text-xs font-normal text-muted-foreground">— Login required for most screens; demo data unless Supabase is configured</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/academics" className="group">
            <Card className="hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                  </span>
                  ACADEMICS
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">8 semesters • ~170cr • Course AI Professor per course</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">PYQ analyzer HIGH/MEDIUM/LOWER + CA1/CA2/EndSem/Viva + SM-2 mastery + honest CGPA</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-hub" className="group">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 group-hover:-translate-y-0.5 group-hover:shadow-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </span>
                  AI HUB ⭐ CORE
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription className="text-xs">Course Professors + Domain Experts + RAG with citations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Provider-agnostic, model registry, router, fallback, cost dashboard</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/skills" className="group">
            <Card className="hover:shadow-md hover:border-violet-200 transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-600" />
                  </span>
                  SKILLS
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">Skill graph NOW/NEXT/LATER/PARKED + Expert framework</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">8 skills + 10 builtin experts + custom expert creation</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects" className="group">
            <Card className="hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-emerald-600" />
                  </span>
                  PROJECTS
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">BEGINNER → CLIENT progression with evidence</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">3 sample projects + level system + portfolio bridge</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portfolio" className="group">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                  </span>
                  PORTFOLIO
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">Problem/Solution/Tech/Evidence — not fake</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Evidence graph Skills→Projects→Portfolio→Freelancing→Career</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/freelancing" className="group">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </span>
                  FREELANCING
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">Readiness matrix + client simulation + disclaimer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Services + brief + lead→deliverables flow, no guaranteed income</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/career" className="group">
            <Card className="hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </span>
                  CAREER + ORCHESTRATOR
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">Global coordinator + goals + priority + anti-overload</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">What should I do next? + academic protection + weekly planner</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/documents" className="group">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </span>
                  DOCUMENTS
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">Upload → Chunk → Embed → Retrieve → Cite</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">RAG pipeline with metadata, citations, prompt injection defense</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics" className="group">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full group-hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                  </span>
                  ANALYTICS
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-xs">Mastery, usage, cost, time tracking, reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Weekly/monthly/semester/year + academic vs professional hours</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* What Works — Polished 100% */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-green-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 text-[15px]">
              <CheckCircle className="w-5 h-5" />
              What works, what is mock, what is missing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[13px] leading-relaxed">
            <p className="font-medium text-green-700">REAL — built and covered by automated tests</p>
            <p>✅ <strong>Build</strong> — 23 routes compile and serve, 0 TypeScript errors</p>
            <p>✅ <strong>Tests</strong> — 73 tests pass (<code className="px-1 rounded bg-secondary text-xs">npm test</code>)</p>
            <p>✅ <strong>Curriculum engine</strong> — 8 semesters, 31 courses, ~170 credits, units, topics, COs, prerequisites</p>
            <p>✅ <strong>Academic maths</strong> — CGPA/GPA, SM-2 revision, PYQ families/frequency, CA-1/CA-2/EndSem test generator</p>
            <p>✅ <strong>RAG pipeline</strong> — chunk → embed → retrieve → citations, with per-user isolation and fabricated-citation rejection</p>
            <p>✅ <strong>AI plumbing</strong> — 5 provider adapters, model registry, task router, fallback chain, usage tracking</p>
            <p>✅ <strong>File safety</strong> — size/type validation and path-traversal protection in storage paths</p>

            <p className="font-medium text-amber-700 pt-2">MOCK — you can click it, but nothing is really saved or answered</p>
            <p>🟡 <strong>Login</strong> — <code className="px-1 rounded bg-secondary text-xs">yaswanth@local / ceg-ece</code> only; no real accounts</p>
            <p>🟡 <strong>Database</strong> — browser localStorage and process memory; cleared on refresh/restart</p>
            <p>🟡 <strong>AI answers</strong> — labelled MOCK RESPONSE until you add a provider key</p>
            <p>🟡 <strong>File upload</strong> — metadata only; no binary stored in Supabase Storage</p>
            <p>🟡 <strong>Skills, Projects, Portfolio, Freelancing, Career, Analytics, Admin</strong> — screens with sample data, not wired to a database</p>

            <p className="font-medium text-red-700 pt-2">MISSING — does not work at all yet</p>
            <p>❌ <strong>PDF text extraction</strong> — real PDFs are rejected; upload .txt/.csv/.md for now</p>
            <p>❌ <strong>Supabase RLS in practice</strong> — schema exists, but no project has been connected, so policies are untested</p>
            <p>❌ <strong>Production auth and multi-user isolation</strong> — depends on Supabase being configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Quick Start — 3 Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px]">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <p className="font-medium">Mock mode (no setup)</p>
                <p className="text-muted-foreground">Run <code className="px-1.5 py-0.5 rounded bg-secondary text-xs">npm run dev</code> → Login <code className="px-1 py-0.5 rounded bg-secondary text-xs">yaswanth@local / ceg-ece</code> → Explore all 23 routes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <p className="font-medium">Real mode (Supabase + AI)</p>
                <p className="text-muted-foreground">Create Supabase project → Set env vars from <code className="px-1 py-0.5 rounded bg-secondary text-xs">.env.example</code> → Run migrations → Add Gemini free key</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <p className="font-medium">Verify it yourself</p>
                <p className="text-muted-foreground">Run <code className="px-1 py-0.5 rounded bg-secondary text-xs">npm test</code> → 73 tests must pass → then <code className="px-1 py-0.5 rounded bg-secondary text-xs">npm run build</code></p>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Link href="/settings">
                <Button size="sm" variant="outline" className="h-8 text-xs">Settings</Button>
              </Link>
              <Link href="/settings/backup">
                <Button size="sm" variant="outline" className="h-8 text-xs">Backup/Export</Button>
              </Link>
              <Link href="/admin">
                <Button size="sm" variant="outline" className="h-8 text-xs">Admin</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer note — polished */}
      <Card className="border-dashed">
        <CardContent className="pt-6 text-xs text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Polymath OS Philosophy:</strong> Function &gt; Decoration. Academic protection during exams, professional during vacations. NOW/NEXT/LATER/PARKED anti-overload — go deep, not shallow. Honest tools: PYQ HIGH/MEDIUM/LOWER historical relevance not guarantee, CGPA with disclaimer verify official, portfolio evidence not fake, freelancing readiness not fake + no guaranteed income, no hallucinated regulations/videos. Supabase primary cloud, not just localStorage. Provider-agnostic AI with fallback and cost control.</p>
          <p className="mt-2">Built incrementally: W1 Core Repair + Architecture + DB + Auth, W2 LLM/AI Core + RAG, W3 Academic Engine + PYQ + Mastery + CGPA, W4 Skills + Multi-Expert + Projects + Portfolio + Freelancing, W5 Polymath + Orchestrator + Analytics + Deploy. See <code className="px-1 py-0.5 rounded bg-secondary">docs/</code> for audit, architecture, RAG, integration tests, quality gate, deployment, security.</p>
        </CardContent>
      </Card>
    </div>
  );
}
