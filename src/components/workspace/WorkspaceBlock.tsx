"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WorkspaceBlock as WorkspaceBlockType, WorkspaceFile, WorkspaceNote } from "@/lib/workspace/types";
import { FileText, MoreHorizontal, Star, Download, Trash2, Eye, MessageSquare, Pin } from "lucide-react";
import { useState } from "react";

interface WorkspaceBlockProps {
  block: WorkspaceBlockType;
  files: WorkspaceFile[];
  notes: WorkspaceNote[];
  onUpload?: () => void;
  onFileAction?: (fileId: string, action: "preview" | "download" | "delete" | "favorite" | "ask-ai" | "pin") => void;
  onNoteAction?: (noteId: string, action: "edit" | "delete" | "favorite") => void;
}

export function WorkspaceBlock({ block, files, notes, onUpload, onFileAction, onNoteAction }: WorkspaceBlockProps) {
  const [showAll, setShowAll] = useState(false);
  const displayFiles = showAll ? files : files.slice(0, 5);
  const displayNotes = showAll ? notes : notes.slice(0, 3);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-[16px]">{block.icon || "📁"}</div>
            <div>
              <CardTitle className="text-[14px] flex items-center gap-1.5">
                {block.name}
                <span className="text-[11px] font-normal text-muted-foreground">• {files.length + notes.length} items</span>
              </CardTitle>
              <CardDescription className="text-xs">{block.description}</CardDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onUpload}>
            + Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Files */}
        {files.length === 0 && notes.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-secondary mx-auto flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No files yet in {block.name}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Drag files here or click Upload — Storage independent, AI optional</p>
          </div>
        ) : (
          <>
            {displayFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-card hover:bg-secondary/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-xs">
                  {file.file_type === "PDF" ? "📑" : file.file_type === "VIDEO" ? "🎥" : file.file_type === "AUDIO" ? "🎧" : file.file_type === "IMAGES" ? "🖼" : file.file_type === "HTML" ? "🌐" : "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate flex items-center gap-1">
                    {file.filename}
                    {file.is_favorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size_bytes / 1024).toFixed(1)}KB • {new Date(file.created_at).toLocaleDateString()} • {file.storage_status} • AI: {file.ai_indexing_status}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onFileAction?.(file.id, "preview")} title="Preview">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onFileAction?.(file.id, "ask-ai")} title="Ask AI about this file">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onFileAction?.(file.id, "pin")} title="Pin to AI context">
                    <Pin className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onFileAction?.(file.id, "favorite")} title="Favorite">
                    <Star className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onFileAction?.(file.id, "download")} title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onFileAction?.(file.id, "delete")} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Notes */}
            {displayNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">📝</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate flex items-center gap-1">
                    {note.title}
                    {note.is_favorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.content.slice(0, 100)}...</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{new Date(note.created_at).toLocaleDateString()} • {note.tags || "No tags"}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onNoteAction?.(note.id, "edit")} title="Edit">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => onNoteAction?.(note.id, "delete")} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {(files.length > 5 || notes.length > 3) && (
              <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show less" : `Show all ${files.length + notes.length} items`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Workspace Overview Card
export function WorkspaceOverview({ totalFiles, storageUsed, byType }: { totalFiles: number; storageUsed: number; byType: Record<string, number> }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px]">Workspace Overview</CardTitle>
        <CardDescription className="text-xs">Storage independent, AI optional — Files organized, not auto-injected into AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-[13px]">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground">Files</p>
            <p className="font-bold text-[16px]">{totalFiles}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground">Storage Used</p>
            <p className="font-bold text-[16px]">{(storageUsed / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {Object.entries(byType).map(([type, size]) => (
            <div key={type} className="flex justify-between text-xs">
              <span>{type}</span>
              <span className="text-muted-foreground">{(size / 1024).toFixed(1)}KB</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground pt-2 border-t">Uploading a file does NOT automatically inject into AI. Use Ask AI, Add to context, Pin to context explicitly — keeps token costs efficient.</p>
      </CardContent>
    </Card>
  );
}
