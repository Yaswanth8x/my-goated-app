// ============================================================
// Backup / Export — JSON, CSV, docs
// Workspace 5 Part 120
// ============================================================

export interface BackupData {
  user_id: string;
  profiles: any[];
  courses: any[];
  conversations: any[];
  messages: any[];
  documents: any[];
  skills: any[];
  projects: any[];
  portfolio: any[];
  goals: any[];
  analytics: any[];
  exported_at: string;
  version: string;
}

export function generateBackup(userId: string): BackupData {
  // In real implementation, fetch from Supabase
  // For now, mock from localStorage

  let conversations: any[] = [];
  let memories: any[] = [];

  if (typeof window !== "undefined") {
    try {
      const convStored = localStorage.getItem("polymath_conversations");
      if (convStored) conversations = JSON.parse(convStored);

      const memStored = localStorage.getItem("polymath_memories");
      if (memStored) memories = JSON.parse(memStored);
    } catch {}
  }

  return {
    user_id: userId,
    profiles: [{ user_id: userId, email: "mock@example.com" }],
    courses: [],
    conversations,
    messages: conversations.flatMap((c: any) => c.messages || []),
    documents: [],
    skills: [],
    projects: [],
    portfolio: [],
    goals: [],
    analytics: [],
    exported_at: new Date().toISOString(),
    version: "0.1.0",
  };
}

export function exportToJson(data: BackupData): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCsv(data: any[], fields: string[]): string {
  const header = fields.join(",");
  const rows = data.map((row) => fields.map((f) => JSON.stringify(row[f] || "")).join(","));
  return [header, ...rows].join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string = "application/json"): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
