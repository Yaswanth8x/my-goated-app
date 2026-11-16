"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { getWorkspaces, getOrCreateGlobalVault } from "@/lib/workspace/workspace";
import { getStorageUsage } from "@/lib/workspace/files";
import { Workspace } from "@/lib/workspace/types";
import { Folder, Plus, Search } from "lucide-react";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const userId = user?.id || "mock-user";
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Ensure global vault exists
    getOrCreateGlobalVault(userId);
    setWorkspaces(getWorkspaces(userId));
  }, [userId]);

  const filtered = workspaces.filter((w) => !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.description && w.description.toLowerCase().includes(search.toLowerCase())));

  const usage = getStorageUsage(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WORKSPACES — AI Professor + Personal Knowledge Workspace</h1>
        <p className="text-muted-foreground text-[13px]">Every AI Professor/Expert has AI Interface + Workspace Vault — My Documents, HTML, PDFs, Videos, Audio/Journal, Data/Database, Notes, Images — Storage independent, AI optional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Folder className="w-4 h-4" />
                My Workspaces — {filtered.length} total
              </CardTitle>
              <CardDescription className="text-xs">Global Personal Vault + AI-Space Storage — No accidental cross-space mixing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    placeholder="Search workspaces — ECE, Photography, Web Dev..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm"
                  />
                </div>
                <Button size="sm" onClick={() => alert("Create workspace — In real implementation, auto-created when you create AI Space: Create AI Space → Create Workspace automatically → Create default blocks → Ready")}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Workspace
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((ws) => (
                  <Link key={ws.id} href={`/workspaces/${ws.id}`}>
                    <Card className="hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer h-full hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[14px] flex items-center gap-2">
                          <span className="text-[18px]">{ws.icon || "📦"}</span>
                          {ws.name}
                        </CardTitle>
                        <CardDescription className="text-xs">{ws.description || `${ws.ai_space_type} workspace — ${ws.ai_space_id || "global"}`}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <p>Type: {ws.ai_space_type} • ID: {ws.ai_space_id || ws.course_id || ws.expert_id || "global"}</p>
                        <p>Created: {new Date(ws.created_at).toLocaleDateString()}</p>
                        <div className="mt-2 flex gap-1.5">
                          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px]">📄 Docs</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px]">📑 PDFs</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px]">🎥 Videos</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px]">📝 Notes</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-2 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No workspaces yet — Create ECE Professor → Workspace auto-created</p>
                    <p className="text-xs text-muted-foreground mt-1">When you create custom expert "Embedded Systems Mentor", app auto-creates Embedded Systems Mentor Workspace with Documents, PDFs, Videos, Audio, Notes, Data, etc.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-xs text-muted-foreground space-y-2">
              <p><strong>Global Personal Storage vs AI-Space Storage:</strong></p>
              <p>MY PERSONAL VAULT (General Documents, Notes, Media) — belongs to user generally</p>
              <p>AI PROFESSOR SPACES: ECE Professor Workspace, Mathematics Professor Workspace, Web Dev Mentor Workspace, Photography Mentor Workspace — each independent</p>
              <p>Mechanism: Move to another workspace, Copy to another workspace, Add reference/link to another workspace — Do not duplicate huge media files unnecessarily when reference/link architecture better</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="text-[13px] space-y-2">
              <p className="font-bold text-[18px]">{(usage.total / 1024 / 1024).toFixed(2)} MB used</p>
              <div className="space-y-1">
                {Object.entries(usage.by_type).map(([type, size]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span>{type}</span>
                    <span className="text-muted-foreground">{(size / 1024).toFixed(1)}KB</span>
                  </div>
                ))}
                {Object.keys(usage.by_type).length === 0 && <p className="text-xs text-muted-foreground">No files yet — upload to see breakdown PDFs 600MB Videos 1.2GB Audio 300MB etc.</p>}
              </div>
              <p className="text-[11px] text-muted-foreground pt-2 border-t">Implementation respects actual storage limits of backend — Not fake unlimited storage UI</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>Every AI Space: AI Chat + Workspace Vault</p>
              <p>Workspace: My Documents, HTML Concepts, PDFs, Videos, Audio/Journal, Data/Database, Notes, Images</p>
              <p>Each block independent with files, metadata, actions, organization</p>
              <p>Storage layer independent optional AI layer — file stored does NOT auto-enter AI context</p>
              <p>Explicit controls: Ask AI about this file, Add to current conversation, Pin to AI context, Remove, Summarize, Generate notes, Search inside</p>
              <p>Future: AI semantic search, document RAG, PDF QA, audio/video transcription, OCR, auto tagging, knowledge graphs, flashcards, quiz, study notes, citations, versioning, recommendations, analytics — But build STABLE STORAGE → ORGANIZATION → RETRIEVAL → OPTIONAL AI PROCESSING not everything at once</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
