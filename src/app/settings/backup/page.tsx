"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateBackup, exportToJson, downloadFile } from "@/lib/polymath/backup";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";

export default function BackupPage() {
  const { user } = useAuth();
  const userId = user?.id || "mock-user";
  const [backupData, setBackupData] = useState<any>(null);

  const handleGenerate = () => {
    const data = generateBackup(userId);
    setBackupData(data);
  };

  const handleDownloadJson = () => {
    if (!backupData) return;
    const json = exportToJson(backupData);
    downloadFile(json, `polymath-backup-${userId}-${new Date().toISOString().slice(0, 10)}.json`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">BACKUP / EXPORT — Part 120</h1>
        <p className="text-muted-foreground">JSON export, CSV where useful, document export where practical — Primary cloud: Supabase, not just local browser storage</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup / Cloud — Part 120</CardTitle>
          <CardDescription>Supabase is primary cloud, not just local browser storage. Persist: users, courses, conversations, messages, documents metadata, RAG metadata, skills, projects, portfolio, settings, AI usage, mastery, tests, grades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleGenerate}>Generate Backup (JSON)</Button>
            {backupData && <Button variant="outline" onClick={handleDownloadJson}>Download JSON</Button>}
          </div>

          {backupData && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Backup Preview:</p>
              <pre className="p-3 rounded bg-secondary text-xs overflow-auto max-h-96">{JSON.stringify(backupData, null, 2).slice(0, 5000)}...</pre>
              <p className="text-xs text-muted-foreground">Full backup includes: profiles, courses, conversations ({backupData.conversations.length}), messages ({backupData.messages.length}), documents, skills, projects, portfolio, goals, analytics, exported_at, version</p>
            </div>
          )}

          <div className="p-3 rounded bg-secondary text-xs space-y-1">
            <p className="font-medium">What is backed up:</p>
            <ul className="list-disc pl-4">
              <li>Users, profiles, courses, semesters, units, topics, COs</li>
              <li>Conversations, messages, memories, documents metadata, RAG metadata (chunks)</li>
              <li>Skills, user_skills, experts, projects, portfolio, freelance services, goals, CGPA records, PYQs, tests</li>
              <li>Settings, AI providers (encrypted), AI usage, mastery, etc.</li>
            </ul>
            <p className="mt-2">Primary cloud: Supabase (PostgreSQL, Auth, Storage, RLS, Realtime where useful) — not just local browser storage. Local backup via JSON export, CSV where useful, document export where practical. Future: encrypted backup.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Backup — Current Implementation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Currently: localStorage for conversations, memories, chunks (mock mode). When Supabase configured, cloud persistence via Supabase. Backup generates JSON from localStorage + Supabase (when configured).</p>
          <p className="mt-2">Future: Encrypted backup, automatic cloud backup, versioning.</p>
        </CardContent>
      </Card>
    </div>
  );
}
