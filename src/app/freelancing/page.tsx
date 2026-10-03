"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { sampleServices, calculateReadiness, simulateClientBrief, freelancingDisclaimer } from "@/lib/freelancing/freelanceEngine";
import { getMockUserSkills } from "@/lib/skills/skillDatabase";
import { useState } from "react";

export default function FreelancingPage() {
  const userId = "mock-user";
  const userSkills = getMockUserSkills(userId);
  const skillLevels = Object.fromEntries(userSkills.map((us) => [us.skill_id, us.level]));
  const readiness = calculateReadiness(userId, 2, skillLevels, 3);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FREELANCING — Freelancing Engine</h1>
        <p className="text-muted-foreground">Services, Leads, Clients, Projects, Briefs, Proposals, Deliverables, Revisions, Portfolio, Readiness — Parts 97-99</p>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4 text-xs">
          <p className="font-medium text-amber-800 dark:text-amber-200">⚠️ Disclaimer — No Guaranteed Income</p>
          <p className="text-amber-700 dark:text-amber-300 mt-1 whitespace-pre-wrap">{freelancingDisclaimer}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services — Part 97</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleServices.map((service) => (
                <div key={service.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{service.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{service.pricing}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedService(service.id)}>
                      View Brief Simulation
                    </Button>
                    <Button size="sm" variant="ghost">
                      Edit Service
                    </Button>
                  </div>
                  {selectedService === service.id && (
                    <div className="mt-3 p-2 rounded bg-secondary text-xs whitespace-pre-wrap">
                      {simulateClientBrief(service)}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Simulation — Part 98</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Simulates client briefs, proposals, deliverables, revisions.</p>
              <div className="p-2 rounded bg-secondary text-xs">
                <p className="font-medium">Example Flow:</p>
                <p>1. Lead from LinkedIn → Contacted → Qualified</p>
                <p>2. Client brief → Proposal (timeline, price, deliverables)</p>
                <p>3. Client approves → In Progress → Deliverables → Revisions → Completed</p>
                <p>4. Testimonial → Portfolio → Readiness increases</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Freelance Readiness — Part 99</CardTitle>
              <CardDescription className="text-xs">Matrix, not fake score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Portfolio</span>
                  <span>{readiness.portfolio}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${readiness.portfolio}%` }}></div>
                </div>
                <div className="flex justify-between">
                  <span>Skills</span>
                  <span>{readiness.skills}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${readiness.skills}%` }}></div>
                </div>
                <div className="flex justify-between">
                  <span>Projects</span>
                  <span>{readiness.projects}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${readiness.projects}%` }}></div>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Overall</span>
                  <span>{readiness.overall}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${readiness.overall}%` }}></div>
                </div>
              </div>

              <div>
                <p className="font-medium">Missing for 100%:</p>
                <ul className="list-disc pl-4 text-xs text-muted-foreground">
                  {readiness.missing.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Freelancing Engine</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-muted-foreground">
              <p>Services, Leads, Clients, Projects, Briefs, Proposals, Deliverables, Revisions, Portfolio, Readiness — all with user_id isolation and RLS.</p>
              <p className="mt-2">During exams, academic protection reduces freelance workload.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
