"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { sampleProjects, createPortfolioFromProject } from "@/lib/projects/projectEngine";
import { useState } from "react";

export default function PortfolioPage() {
  const [portfolioItems] = useState(() => sampleProjects.slice(0, 2).map((p) => createPortfolioFromProject(p)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PORTFOLIO — Portfolio Engine</h1>
        <p className="text-muted-foreground">Project, problem, solution, tech, skills, screenshots, links, docs, role, date, quality, review, evidence — Part 96</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>
                {item.role} • {item.date?.slice(0, 10)} • Quality: {item.quality}/5
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <p className="font-medium">Problem:</p>
                <p className="text-muted-foreground">{item.problem}</p>
              </div>
              <div>
                <p className="font-medium">Solution:</p>
                <p className="text-muted-foreground">{item.solution}</p>
              </div>
              <div>
                <p className="font-medium">Tech:</p>
                <p className="text-muted-foreground">{item.tech?.join(", ")}</p>
              </div>
              <div>
                <p className="font-medium">Evidence (not fake):</p>
                <p className="text-muted-foreground text-xs">{item.evidence}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  View GitHub
                </Button>
                <Button size="sm" variant="outline">
                  View Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume/Portfolio Bridge — Part 115 (Preview)</CardTitle>
          <CardDescription>Portfolio → Resume, Career dashboard, Professional evidence graph</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Future: Export portfolio to resume, link to career dashboard, evidence graph shows skills → projects → portfolio → freelance readiness.</p>
        </CardContent>
      </Card>
    </div>
  );
}
