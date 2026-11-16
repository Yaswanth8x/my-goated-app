"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getMockAnalytics, generateReview } from "@/lib/polymath/analytics";
import { getMockUserSkills } from "@/lib/skills/skillDatabase";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const userId = "mock-user";
  const analytics = getMockAnalytics(userId);
  const userSkills = getMockUserSkills(userId);
  const [usage, setUsage] = useState<any>(null);

  const weekly = generateReview("weekly", analytics);
  const monthly = generateReview("monthly", analytics);
  const semester = generateReview("semester", analytics);
  const year = generateReview("year", analytics);

  useEffect(() => {
    fetch("/api/ai/usage")
      .then((res) => res.json())
      .then((data) => setUsage(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ANALYTICS — Learning Analytics — Part 117</h1>
        <p className="text-muted-foreground">Mastery over time, weak/strong areas, skill progress, usage, time tracking — Workspace 5</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Academic Mastery</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Overall: {analytics.academic.avg_mastery}% (mock)</p>
            <p>Weak: {analytics.academic.weak_areas.join(", ")}</p>
            <p>Strong: CO3 (85%)</p>
            <p>Tests: {analytics.academic.tests_taken}, Avg Score: {analytics.academic.avg_score}%</p>
            <div className="mt-2 w-full bg-secondary rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${analytics.academic.avg_mastery}%` }}></div>
            </div>
            <div className="mt-3 h-20 rounded bg-secondary flex items-end gap-1 p-2">
              <div className="flex-1 bg-primary rounded-t" style={{ height: `${analytics.academic.avg_mastery}%` }} />
              <div className="flex-1 bg-primary/70 rounded-t" style={{ height: "70%" }} />
              <div className="flex-1 bg-primary/50 rounded-t" style={{ height: "45%" }} />
              <div className="flex-1 bg-primary rounded-t" style={{ height: "80%" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Usage (30d) + Time Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {usage ? (
              <>
                <p>Total Cost: ${usage.total_cost?.toFixed(4) || "0.0000"}</p>
                <p>Requests: {usage.total_requests || 0}</p>
                <p>By Provider: {Object.keys(usage.by_provider || {}).join(", ") || "mock"}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Loading usage...</p>
            )}
            <div className="pt-2 border-t">
              <p>Academic: {analytics.time_tracking.academic_hours}h/week</p>
              <p>Professional: {analytics.time_tracking.professional_hours}h/week</p>
              <p>Total: {analytics.time_tracking.total_hours}h/week</p>
              <div className="h-4 rounded bg-secondary overflow-hidden flex mt-2">
                <div className="h-full bg-blue-500" style={{ width: `${(analytics.time_tracking.academic_hours / analytics.time_tracking.total_hours) * 100}%` }} />
                <div className="h-full bg-green-500" style={{ width: `${(analytics.time_tracking.professional_hours / analytics.time_tracking.total_hours) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Blue: Academic, Green: Professional</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {userSkills.slice(0, 4).map((us) => (
              <div key={us.skill_id}>
                <div className="flex justify-between text-xs">
                  <span>{us.skill_id}</span>
                  <span>{us.level}%</span>
                </div>
                <div className="h-2 rounded bg-secondary overflow-hidden mt-1">
                  <div className="h-full bg-primary" style={{ width: `${us.level}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-2">Overall: Growing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Weekly Review — Part 110</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{weekly.summary}</p>
            <p className="mt-2"><strong>Achievements:</strong> {weekly.achievements.join(", ")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Review — Part 111</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{monthly.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Semester Review — Part 112</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{semester.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Year Review — Part 112</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{year.summary}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics — Part 117 — Full</CardTitle>
          <CardDescription>Learning analytics, skill analytics, time tracking, mastery trends, weekly/monthly/semester/year reviews</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Weekly/monthly/semester/year reviews track progress, achievements, next focus.</p>
          <p className="mt-2">For now: Mock data, real when Supabase and usage tracking fully implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
}
