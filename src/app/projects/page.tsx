"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { sampleProjects, projectLevelDescriptions } from "@/lib/projects/projectEngine";
import { getMockUserSkills } from "@/lib/skills/skillDatabase";
import Link from "next/link";

export default function ProjectsPage() {
  const userId = "mock-user";
  const userSkills = getMockUserSkills(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PROJECTS — Project Engine</h1>
        <p className="text-muted-foreground">BEGINNER → INTERMEDIATE → ADVANCED → REAL-WORLD → PORTFOLIO → CLIENT/PRODUCT — Workspace 4 Part 95</p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-indigo-700 dark:text-indigo-300">Project Progression</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 overflow-x-auto text-xs">
          {Object.entries(projectLevelDescriptions).map(([level, desc]) => (
            <div key={level} className="min-w-[150px] p-2 rounded border bg-card">
              <p className="font-medium">{level}</p>
              <p className="text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {project.title}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    project.level === "BEGINNER"
                      ? "bg-green-100 text-green-700"
                      : project.level === "INTERMEDIATE"
                      ? "bg-amber-100 text-amber-700"
                      : project.level === "PORTFOLIO"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {project.level}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                {project.skill_id} • {project.expert_id} • {project.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">{project.description}</p>
              {project.tech_stack && <p className="text-xs">Tech: {project.tech_stack.join(", ")}</p>}
              <div className="flex gap-2">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" className="text-xs text-indigo-600 hover:underline">
                    GitHub
                  </a>
                )}
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" className="text-xs text-indigo-600 hover:underline">
                    Demo
                  </a>
                )}
              </div>
              <Button size="sm" variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Engine — Part 96</CardTitle>
          <CardDescription>Store: project, problem, solution, tech, skills, screenshots, links, docs, role, date, quality, review, evidence</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>Every project can be converted to portfolio item with evidence (not fake). Evidence: GitHub commits, deployed URL, screenshots, documentation.</p>
          <Link href="/portfolio">
            <Button size="sm" className="mt-2">
              Go to Portfolio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
