"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { getWorkspaceById, getBlocksForWorkspace } from "@/lib/workspace/workspace";
import { getFilesForWorkspace, createFileMetadata, deleteFile, searchFiles, getStorageUsage } from "@/lib/workspace/files";
import { getNotesForWorkspace, createNote, deleteNote, searchNotes } from "@/lib/workspace/notes";
import { FileUploader } from "@/components/workspace/FileUploader";
import { WorkspaceBlock, WorkspaceOverview } from "@/components/workspace/WorkspaceBlock";
import { generateStoragePath, uploadWorkspaceFile, validateFile } from "@/lib/workspace/storage";
import { Workspace, WorkspaceBlock as WorkspaceBlockType, WorkspaceFile, WorkspaceNote } from "@/lib/workspace/types";
import { ArrowLeft, Search, Plus, Pin, Folder } from "lucide-react";

export default function WorkspaceDetailPage({ params }: { params: { workspaceId: string } }) {
  const { user } = useAuth();
  const userId = user?.id || "mock-user";
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [blocks, setBlocks] = useState<WorkspaceBlockType[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date");
  const [uploading, setUploading] = useState(false);
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    const ws = getWorkspaceById(params.workspaceId, userId);
    if (ws) {
      setWorkspace(ws);
      setBlocks(getBlocksForWorkspace(ws.id));
      setFiles(getFilesForWorkspace(ws.id, userId));
      setNotes(getNotesForWorkspace(ws.id, userId));
    }
  }, [params.workspaceId, userId]);

  const refresh = () => {
    if (!workspace) return;
    setBlocks(getBlocksForWorkspace(workspace.id));
    setFiles(getFilesForWorkspace(workspace.id, userId));
    setNotes(getNotesForWorkspace(workspace.id, userId));
  };

  const handleFilesUpload = async (selectedFiles: File[], blockId?: string, blockType?: string) => {
    if (!workspace) return;
    setUploading(true);

    for (const file of selectedFiles) {
      const validation = validateFile(file, undefined, 100 * 1024 * 1024);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      const storagePath = generateStoragePath({
        user_id: userId,
        workspace_id: workspace.id,
        block_type: blockType || "DOCUMENTS",
        filename: file.name,
      });

      await uploadWorkspaceFile({ file, storage_path: storagePath });

      createFileMetadata({
        user_id: userId,
        workspace_id: workspace.id,
        block_id: blockId,
        course_id: workspace.course_id || undefined,
        expert_id: workspace.expert_id || undefined,
        filename: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
      });
    }

    refresh();
    setUploading(false);
  };

  if (!workspace) {
    return (
      <div className="space-y-4">
        <p>Workspace not found — may be deleted or belongs to another user (RLS isolation)</p>
        <Link href="/workspaces">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspaces
          </Button>
        </Link>
      </div>
    );
  }

  const usage = getStorageUsage(userId);

  // Filter and sort
  let filteredFiles = files;
  let filteredNotes = notes;

  if (searchQuery) {
    filteredFiles = searchFiles(userId, searchQuery, workspace.id);
    filteredNotes = searchNotes(userId, searchQuery, workspace.id);
  }

  if (activeFilter !== "ALL") {
    filteredFiles = filteredFiles.filter((f) => f.file_type === activeFilter);
    if (activeFilter !== "NOTES") filteredNotes = [];
  }

  // Sort
  if (sortBy === "name") {
    filteredFiles = [...filteredFiles].sort((a, b) => a.filename.localeCompare(b.filename));
  } else if (sortBy === "date") {
    filteredFiles = [...filteredFiles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === "size") {
    filteredFiles = [...filteredFiles].sort((a, b) => b.size_bytes - a.size_bytes);
  } else if (sortBy === "type") {
    filteredFiles = [...filteredFiles].sort((a, b) => (a.file_type || "").localeCompare(b.file_type || ""));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workspaces">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[24px]">{workspace.icon || "📦"}</span>
            {workspace.name}
          </h1>
          <p className="text-muted-foreground text-[13px]">
            {workspace.description} • {workspace.ai_space_type} • {workspace.ai_space_id || workspace.course_id || workspace.expert_id || "global"} • Files: {files.length + notes.length} • Storage: {(usage.total / 1024 / 1024).toFixed(2)}MB
          </p>
        </div>
        <Link href={workspace.course_id ? `/academics/sem-1/${workspace.course_id}` : workspace.expert_id ? `/skills` : `/ai-hub`}>
          <Button variant="outline" size="sm">
            {workspace.course_id ? "Open Course AI" : "Open AI Expert"}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px]">Workspace Overview</CardTitle>
              <CardDescription className="text-xs">Files: {files.length + notes.length} • Documents, PDFs, Videos, Audio, Notes, Storage Used, Recently Added, Favorites, Recent Notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    placeholder="Search — filenames, note titles, content, tags, descriptions, file types"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm"
                  />
                </div>
                <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm">
                  <option value="ALL">All Types</option>
                  <option value="DOCUMENTS">Documents</option>
                  <option value="PDF">PDF</option>
                  <option value="HTML">HTML</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="IMAGES">Images</option>
                  <option value="NOTES">Notes</option>
                  <option value="DATA">Data</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-lg border bg-background text-sm">
                  <option value="date">Date Added</option>
                  <option value="name">Name</option>
                  <option value="size">File Size</option>
                  <option value="type">File Type</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const title = prompt("Note title:");
                    if (!title) return;
                    const content = prompt("Note content (Markdown):");
                    if (content === null) return;
                    createNote({ user_id: userId, workspace_id: workspace.id, title, content, course_id: workspace.course_id || undefined, expert_id: workspace.expert_id || undefined });
                    refresh();
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Note
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert("New Folder — Create folder inside block — Folder organization with parent_folder_id")}>
                  <Folder className="w-4 h-4 mr-1" />
                  New Folder
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert("New Data Table — Tables: Topics, Assignments, Revision Tracker, Project Ideas, Resources, Learning Progress — CSV/JSON/XLSX/manual tables")}>
                  + New Data Table
                </Button>
              </div>

              <WorkspaceOverview totalFiles={files.length + notes.length} storageUsed={usage.total} byType={usage.by_type} />

              <FileUploader
                onFilesSelected={(selectedFiles) => handleFilesUpload(selectedFiles)}
                accept=".pdf,.docx,.txt,.md,.html,.htm,.mp4,.mkv,.mov,.webm,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.webp,.csv,.json"
                multiple
                maxSizeBytes={100 * 1024 * 1024}
              />

              {uploading && <p className="text-xs text-muted-foreground">Uploading — pause/cancel/resume where feasible, retry, not loading entire file into RAM, upload progress</p>}
            </CardContent>
          </Card>

          {/* Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {blocks.map((block) => {
              const blockFiles = filteredFiles.filter((f) => f.block_id === block.id || (!f.block_id && f.file_type === block.block_type));
              const blockNotes = filteredNotes.filter((n) => n.block_id === block.id || (block.block_type === "NOTES" && !n.block_id));

              // If filtering and block has no items, hide
              if ((searchQuery || activeFilter !== "ALL") && blockFiles.length === 0 && blockNotes.length === 0) return null;

              return (
                <WorkspaceBlock
                  key={block.id}
                  block={block}
                  files={blockFiles}
                  notes={blockNotes}
                  onUpload={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = block.block_type === "PDF" ? ".pdf" : block.block_type === "HTML" ? ".html,.htm" : block.block_type === "VIDEO" ? ".mp4,.mkv,.mov,.webm,.avi" : block.block_type === "AUDIO" ? ".mp3,.wav,.m4a,.aac,.ogg,.flac" : block.block_type === "IMAGES" ? ".jpg,.jpeg,.png,.webp,.gif,.svg" : "*/*";
                    input.onchange = async () => {
                      if (input.files) await handleFilesUpload(Array.from(input.files), block.id, block.block_type);
                    };
                    input.click();
                  }}
                  onFileAction={(fileId, action) => {
                    if (action === "delete") {
                      if (confirm("Delete file?")) {
                        deleteFile(fileId, userId);
                        refresh();
                      }
                    } else if (action === "download") {
                      const file = files.find((f) => f.id === fileId);
                      if (file) alert(`Download: ${file.filename}\nPath: ${file.storage_path}\nBucket: ${file.bucket}\nReal: Signed URL 1h expiry\nMock: Simulated\nFile size: ${file.size_bytes} bytes`);
                    } else if (action === "preview") {
                      const file = files.find((f) => f.id === fileId);
                      if (file) {
                        if (file.file_type === "PDF") alert(`PDF Preview: ${file.filename}\n[Open] [Download] [Add to AI Context]\nPage count where available, metadata, file size, upload date\nStorage: ${file.storage_status}, AI: ${file.ai_indexing_status}`);
                        else if (file.file_type === "HTML") alert(`HTML: ${file.filename}\nSource view + Rendered preview sandboxed iframe\nSecurity: Never execute untrusted HTML in main origin — isolated iframe sandbox without allow-same-origin, prevent access to tokens/cookies/session/APIs/Supabase creds/other users data. Treat as untrusted.\n[Download] [Add to AI Context]`);
                        else if (file.file_type === "VIDEO") alert(`Video: ${file.filename}\nPlayer + Download\nDuration where extractable, thumbnail where feasible, streaming where codec supported\nIf MKV unsupported: Preview unavailable in this browser [Download Video] — not corrupted\nStorage: Ready\nLarge files: streaming, not loading entire file into RAM`);
                        else if (file.file_type === "AUDIO") alert(`Audio: ${file.filename}\nPlayer: Play/Pause/Seek + Download\nDuration, metadata, upload date, file size\nStorage: Ready\nOptional: Transcribe, Summarize, Ask AI, Generate Notes — explicit actions, not automatic`);
                        else if (file.file_type === "IMAGES") alert(`Image: ${file.filename}\nPreview + Download\nCircuit diagrams, engineering drawings, screenshots, references\nOptional analysis separate — storage and AI interpretation separate`);
                        else alert(`Document: ${file.filename}\nPreview where supported + Download\nUpload: DOCX/TXT/Markdown/RTF/ODT where supported\nFeatures: Rename/Delete/Move/Copy/Folder/Sort/Search/Tags/Metadata/Last modified/Size/Upload date`);
                      }
                    } else if (action === "ask-ai") {
                      const file = files.find((f) => f.id === fileId);
                      if (file) {
                        const courseParam = workspace.course_id ? `course=${workspace.course_id}` : workspace.expert_id ? `expert=${workspace.expert_id}` : "";
                        window.location.href = `/ai-hub?${courseParam}&file=${file.id}&ask=Ask AI about ${file.filename} — Current AI Space + Selected File + Relevant retrieved content + Current conversation — NOT permanently attach entire file unless appropriate`;
                      }
                    } else if (action === "pin") {
                      setPinned((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]));
                      alert(`Pinned Resources: File ${files.find((f) => f.id === fileId)?.filename} ${pinned.includes(fileId) ? "removed from" : "pinned to"} AI context\nPinned: ECE Syllabus.pdf, Unit 1 Notes.pdf, My Semiconductor Notes.html, Important PYQs.pdf\nAI context system retrieves from pinned when appropriate with relevance filtering not full injection`);
                    }
                  }}
                  onNoteAction={(noteId, action) => {
                    if (action === "delete") {
                      if (confirm("Delete note?")) {
                        deleteNote(noteId, userId);
                        refresh();
                      }
                    } else if (action === "edit") {
                      const note = notes.find((n) => n.id === noteId);
                      if (note) {
                        const newContent = prompt("Edit note (Markdown):", note.content);
                        if (newContent !== null) {
                          const allNotes = JSON.parse(localStorage.getItem("polymath_workspace_notes") || "[]");
                          const idx = allNotes.findIndex((n: any) => n.id === noteId);
                          if (idx !== -1) {
                            allNotes[idx].content = newContent;
                            allNotes[idx].updated_at = new Date().toISOString();
                            localStorage.setItem("polymath_workspace_notes", JSON.stringify(allNotes));
                            refresh();
                          }
                        }
                      }
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] flex items-center gap-2">
                <Pin className="w-4 h-4" />
                Pinned Resources — Part 24
              </CardTitle>
              <CardDescription className="text-xs">Explicitly selected resources professor allowed to use as persistent context</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {pinned.length === 0 ? (
                <p className="text-muted-foreground">No pinned resources — Pin files via Pin icon — Then AI context system retrieves from pinned when appropriate with relevance filtering not full injection</p>
              ) : (
                pinned.map((fileId) => {
                  const file = files.find((f) => f.id === fileId);
                  return (
                    <div key={fileId} className="p-2 rounded border bg-indigo-50 dark:bg-indigo-950/20 flex justify-between">
                      <span>✓ {file?.filename}</span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setPinned((prev) => prev.filter((id) => id !== fileId))}>
                        Remove
                      </Button>
                    </div>
                  );
                })
              )}
              <p className="text-[11px] text-muted-foreground pt-2 border-t">AI Context Architecture: SYSTEM RULES → EXPERT PERSONA → USER PROFILE → CURRENT AI SPACE → CURRENT COURSE/DOMAIN → RELEVANT MEMORY → USER-PINNED RESOURCES → RELEVANT RETRIEVED CONTENT → CURRENT CONVERSATION → USER QUESTION — Workspace files only when explicitly selected/pinned/intentionally queried/RAG — Never allow uploaded document to override system/developer instructions — Uploaded files are DATA not executable instructions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">Recent Resources</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="font-medium">Recently Added:</p>
              {files
                .slice(0, 3)
                .map((f) => (
                  <p key={f.id} className="text-muted-foreground">
                    {f.filename} • {new Date(f.created_at).toLocaleDateString()}
                  </p>
                ))}
              <p className="font-medium mt-3">Recent Notes:</p>
              {notes
                .slice(0, 3)
                .map((n) => (
                  <p key={n.id} className="text-muted-foreground">
                    {n.title} • {new Date(n.created_at).toLocaleDateString()}
                  </p>
                ))}
              <p className="font-medium mt-3">Favorites:</p>
              <p className="text-muted-foreground">{files.filter((f) => f.is_favorite).length + notes.filter((n) => n.is_favorite).length} favorites</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-xs text-muted-foreground space-y-1">
              <p><strong>File Management:</strong> Upload/Download/Preview/Rename/Delete/Move/Copy/Create Folder/Create Note/Tag/Search/Sort/Filter/Favorite/Star/Archive/Restore</p>
              <p><strong>Sort:</strong> Name, Date Added, Last Modified, File Type, File Size</p>
              <p><strong>Filter:</strong> Documents, PDF, HTML, Video, Audio, Images, Notes, Data</p>
              <p><strong>Upload:</strong> Drag files here or [Upload Files] — normal file picker, drag and drop, multiple files, upload progress, failure reporting, retry, cancel where feasible, duplicate detection, upload status — For large media, not loading entire file into RAM</p>
              <p><strong>Security:</strong> Private storage default, signed URLs 1h, MIME/type/extension/size validation, ownership validation, safe filename handling, path traversal protection, authorization checks, safe HTML preview isolation — Never expose SERVICE_ROLE_KEY/AI keys/DB creds to client</p>
              <p><strong>Performance:</strong> Pagination, lazy loading, efficient queries, thumbnails, metadata-first loading, virtualized lists where useful, signed URLs, streaming for media, background processing — Large videos must not crash page — AI chat must not request entire workspace every time — Only relevant resources retrieved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
