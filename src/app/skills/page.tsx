"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { skillDatabase, getSkillGraph, getMockUserSkills } from "@/lib/skills/skillDatabase";
import { builtinExperts, createExpertFromPrompt, getAllExperts } from "@/lib/experts/expertFramework";
import { createWorkspaceForCustomExpert } from "@/lib/workspace/workspace";
import { Brain, Plus, BookOpen, Sparkles, Network } from "lucide-react";
import Link from "next/link";

export default function SkillsPage() {
  const userId = "mock-user";
  const userSkills = getMockUserSkills(userId);
  const skillGraph = getSkillGraph();
  const [customExperts, setCustomExperts] = useState<any[]>([]);
  const [showAddExpert, setShowAddExpert] = useState(false);
  const [newExpertName, setNewExpertName] = useState("");
  const [newExpertPrompt, setNewExpertPrompt] = useState("");

  const allExperts = getAllExperts(customExperts);

  const handleAddExpert = () => {
    if (!newExpertName || !newExpertPrompt) return;

    const expert = createExpertFromPrompt({
      name: newExpertName,
      masterPrompt: newExpertPrompt,
      userId,
    });

    setCustomExperts([...customExperts, expert]);

    // Auto-create workspace for custom expert — Every AI Space has AI + Workspace Vault
    const workspace = createWorkspaceForCustomExpert({
      user_id: userId,
      expert_id: expert.id,
      expert_name: expert.name,
    });

    console.log(`Workspace auto-created for custom expert ${expert.name}: ${workspace.id} with default blocks My Documents, HTML, PDFs, Videos, Audio, Data, Notes, Images`);

    setNewExpertName("");
    setNewExpertPrompt("");
    setShowAddExpert(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SKILLS — Professional Dashboard</h1>
          <p className="text-muted-foreground">Skill database, graph, expert framework, custom experts — Workspace 4</p>
        </div>
        <Button onClick={() => setShowAddExpert(!showAddExpert)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expert
        </Button>
      </div>

      {showAddExpert && (
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-base">Custom Expert Creation — Part 80-82</CardTitle>
            <CardDescription>Name + Master Prompt + Resources → System extracts persona, expertise, roadmap, teaching style, assessment, projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name: e.g., Photography</label>
              <input value={newExpertName} onChange={(e) => setNewExpertName(e.target.value)} placeholder="Photography" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Upload/paste: Photography Master Prompt</label>
              <textarea
                value={newExpertPrompt}
                onChange={(e) => setNewExpertPrompt(e.target.value)}
                placeholder="You are Photography Expert... Expertise: Photography, composition, lighting... Roadmap: BEGINNER: composition, light... Projects: Portrait series..."
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional resources: PDFs, documents, links, notes — for expert-specific RAG (Part 85)</p>
            </div>
            <Button onClick={handleAddExpert}>Create Photography AI</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Skill Database & Graph — Parts 77-78
              </CardTitle>
              <CardDescription>Skills with NOW/NEXT/LATER/PARKED status — protects against shallow learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skillDatabase.map((skill) => {
                  const userSkill = userSkills.find((us) => us.skill_id === skill.id);
                  return (
                    <div key={skill.id} className="p-3 rounded-lg border flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{skill.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{skill.category}</span>
                          {userSkill && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                userSkill.status === "NOW"
                                  ? "bg-green-100 text-green-700"
                                  : userSkill.status === "NEXT"
                                  ? "bg-amber-100 text-amber-700"
                                  : userSkill.status === "LATER"
                                  ? "bg-secondary text-muted-foreground"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {userSkill.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                        {skill.prerequisites && skill.prerequisites.length > 0 && <p className="text-xs text-muted-foreground">Prereqs: {skill.prerequisites.join(", ")}</p>}
                        <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${userSkill?.level || 0}%` }}></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium">{userSkill?.level || 0}%</p>
                        <p className="text-xs text-muted-foreground">Level</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-3 rounded-lg bg-secondary">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Skill Graph
                </p>
                <div className="mt-2 text-xs font-mono">
                  {skillGraph.map((node) => (
                    <div key={node.skill_id} className="flex gap-2">
                      <span>{node.skill_name}</span>
                      <span className="text-muted-foreground">← {node.prerequisites.join(", ") || "none"}</span>
                      <span className="text-muted-foreground">→ {node.dependents.join(", ") || "none"}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Prerequisite graph shows dependencies — e.g., Web Dev → App Dev, Full Stack</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Dashboard — Part 76</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">NOW Skills</p>
                <p className="font-bold text-lg">{userSkills.filter((s) => s.status === "NOW").length}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">NEXT</p>
                <p className="font-bold text-lg">{userSkills.filter((s) => s.status === "NEXT").length}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">LATER</p>
                <p className="font-bold text-lg">{userSkills.filter((s) => s.status === "LATER").length}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">PARKED</p>
                <p className="font-bold text-lg">{userSkills.filter((s) => s.status === "PARKED").length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expert Framework — Parts 79-85</CardTitle>
              <CardDescription className="text-xs">Builtin + Custom experts, each with Overview, AI Chat, Roadmap, Projects, Portfolio, Memory, Mastery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {allExperts.map((expert) => (
                <div key={expert.id} className="p-2 rounded-lg border text-sm hover:bg-secondary cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{expert.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${expert.is_builtin ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
                      {expert.is_builtin ? "Builtin" : "Custom"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{expert.expertise}</p>
                  <div className="mt-2 flex gap-1">
                    <Link href={`/ai-hub?expert=${expert.id}`}>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        Chat
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      Roadmap
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expert Dashboard — Per Expert</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-muted-foreground">
              <p>Every expert gets:</p>
              <ul className="list-disc pl-4">
                <li>Overview, AI Chat, Roadmap, Current Lesson, Practice, Assessments, Projects, Portfolio, Resources, Memory, Mastery, Professional Simulation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-3 text-xs">
              <p className="font-medium text-amber-800 dark:text-amber-200">Custom Expert Creation — Try It</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">Click Add Expert → Name: Photography → Paste master prompt → Creates PHOTOGRAPHY AI. Repeat for Web, Editing, AI Automation, Finance, etc. Expert-specific memory & RAG (Parts 84-85).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
