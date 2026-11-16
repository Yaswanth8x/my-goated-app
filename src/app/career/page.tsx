"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { calculateReadiness } from "@/lib/freelancing/freelanceEngine";
import { getMockUserSkills } from "@/lib/skills/skillDatabase";
import { getMockGoals, calculatePriority, getCrossDomainGraph, getCrossDomainProjects, generateWeeklyPlanner } from "@/lib/polymath/orchestrator";
import { getMockAnalytics, generateReview } from "@/lib/polymath/analytics";
import Link from "next/link";
import { useState } from "react";

export default function CareerPage() {
  const userId = "mock-user";
  const userSkills = getMockUserSkills(userId);
  const skillLevels = Object.fromEntries(userSkills.map((us) => [us.skill_id, us.level]));
  const readiness = calculateReadiness(userId, 2, skillLevels, 3);
  const goals = getMockGoals(userId);
  const priority = calculatePriority(userId, goals, false);
  const priorityExam = calculatePriority(userId, goals, true);
  const crossDomainGraph = getCrossDomainGraph();
  const crossDomainProjects = getCrossDomainProjects();
  const weeklyPlanner = generateWeeklyPlanner(userId, goals);
  const analytics = getMockAnalytics(userId);
  const weeklyReview = generateReview("weekly", analytics);

  const [showExamMode, setShowExamMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CAREER + POLYMATH — Global Orchestrator</h1>
        <p className="text-muted-foreground">Global coordinator, cross-domain graphs, goals, priority, anti-overload, academic protection, planner, career, research, resume bridge, evidence graph — Workspace 5 Parts 101-116</p>
      </div>

      {/* Global Orchestrator */}
      <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Global AI Coordinator — Part 101 — "What should I do next?"</span>
            <Button size="sm" variant="outline" onClick={() => setShowExamMode(!showExamMode)}>
              {showExamMode ? "Exam Mode: ON" : "Exam Mode: OFF"} — Part 108
            </Button>
          </CardTitle>
          <CardDescription>Coordination, not teaching — understands academics, skills, projects, deadlines, mastery, career, portfolio, freelancing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Priority Engine — Part 106 — Next Actions:</p>
            <div className="mt-2 space-y-2">
              {(showExamMode ? priorityExam.next_actions : priority.next_actions).map((task) => (
                <div key={task.id} className="p-2 rounded border bg-card flex justify-between">
                  <span>
                    {task.title} ({task.type})
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">P{task.priority}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{showExamMode ? priorityExam.reasoning : priority.reasoning}</p>
            {(showExamMode ? priorityExam.academic_protection_active : priority.academic_protection_active) && (
              <p className="text-xs mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-700">Academic Protection Active (Part 108): During exam periods, academics take priority, reduce professional workload. During vacations, professional can increase.</p>
            )}
            {priority.overload_warning && <p className="text-xs mt-2 p-2 rounded bg-red-50 border border-red-200 text-red-700">{priority.overload_warning}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Engine — Part 105 + Weekly Planner — Part 109</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-2 rounded border flex justify-between">
                    <span>
                      {goal.title} ({goal.type})
                    </span>
                    <span className="text-xs">
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No deadline"} • P{goal.priority}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-2 rounded bg-secondary">
                <p className="font-medium">Weekly Planner: {weeklyPlanner.week}</p>
                <p className="text-xs text-muted-foreground mt-1">Focus: {weeklyPlanner.focus.slice(0, 200)}...</p>
                <p className="text-xs mt-1">Tasks: {weeklyPlanner.tasks.map((t) => t.title).join(", ")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cross-Domain Skill Graph — Part 102 + Academic/Professional Bridge — Part 103</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                {crossDomainGraph.map((item, idx) => (
                  <div key={idx} className="p-2 rounded border">
                    <p className="font-medium">
                      {item.skill} → {item.connects_to.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">Bridge: {item.bridge}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium">Cross-Domain Project Suggestions — Part 104</p>
                <div className="mt-2 space-y-2">
                  {crossDomainProjects.map((proj, idx) => (
                    <div key={idx} className="p-2 rounded bg-secondary text-xs">
                      <p className="font-medium">{proj.title}</p>
                      <p>Skills: {proj.skills.join(", ")}</p>
                      <p className="text-muted-foreground">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Career Dashboard — Part 113 + Resume/Portfolio Bridge — Part 115 + Evidence Graph — Part 116</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded bg-secondary">
                  <p className="text-xs text-muted-foreground">Skills NOW</p>
                  <p className="font-bold">{userSkills.filter((s) => s.status === "NOW").length}</p>
                </div>
                <div className="p-3 rounded bg-secondary">
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="font-bold">3</p>
                </div>
                <div className="p-3 rounded bg-secondary">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className="font-bold">{readiness.overall}%</p>
                </div>
              </div>
              <p>Career path: ECE → Web Dev (NOW) → Full Stack (NEXT) → AI Automation (NEXT) → Portfolio → Freelancing → Career</p>
              <div className="p-2 rounded bg-secondary font-mono text-xs">
                <p>Skills (Web Dev 65%)</p>
                <p> → Projects (Portfolio Website COMPLETED)</p>
                <p> → Portfolio (Personal Portfolio with evidence)</p>
                <p> → Freelancing (Landing Page Service)</p>
                <p> → Career (Readiness {readiness.overall}%)</p>
              </div>
              <Link href="/portfolio">
                <Button size="sm">View Portfolio</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Anti-Overload — Part 107</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>Every new skill has NOW/NEXT/LATER/PARKED status — protects against shallow learning.</p>
              <div className="space-y-1">
                <p>
                  <strong>NOW:</strong> Actively learning (max 2-3)
                </p>
                <p>
                  <strong>NEXT:</strong> Next after NOW
                </p>
                <p>
                  <strong>LATER:</strong> Later
                </p>
                <p>
                  <strong>PARKED:</strong> Parked, not now
                </p>
              </div>
              <p className="text-muted-foreground">Current NOW: {userSkills.filter((s) => s.status === "NOW").map((s) => s.skill_id).join(", ")}</p>
              {userSkills.filter((s) => s.status === "NOW").length > 3 && <p className="text-red-600">⚠️ Too many NOW — consider moving some to NEXT/LATER/PARKED</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reviews — Parts 110-112</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>
                <strong>{weeklyReview.title}:</strong> {weeklyReview.summary.slice(0, 100)}...
              </p>
              <p>
                <strong>Achievements:</strong> {weeklyReview.achievements.join(", ")}
              </p>
              <p>
                <strong>Next Focus:</strong> {weeklyReview.next_focus.join(", ")}
              </p>
              <p className="text-muted-foreground mt-2">Weekly, monthly, semester, year reviews track progress.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Research Dashboard — Part 114 (Preview)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>Future: Track research interests, papers, experiments, notes — connected to academic and professional.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Global Search — Part 118 + Notifications — Part 119 (Preview)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>Search: Global search across courses, docs, conversations, projects — via Cmd+K in header (coming in Workspace 5).</p>
              <p className="mt-2">Notifications: Live updates via Supabase Realtime where useful (AI generation status, collaboration, notifications, dashboard).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
