"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WorkspaceFile, WorkspaceNote } from "@/lib/workspace/types";
import { X, Download, MessageSquare, Pin } from "lucide-react";

interface FilePreviewProps {
  file?: WorkspaceFile | null;
  note?: WorkspaceNote | null;
  onClose: () => void;
  onAskAI?: () => void;
  onPin?: () => void;
  onDownload?: () => void;
}

export function FilePreview({ file, note, onClose, onAskAI, onPin, onDownload }: FilePreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "source">("preview");

  if (!file && !note) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[15px]">{file?.filename || note?.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {file ? `${file.file_type} • ${(file.size_bytes / 1024).toFixed(1)}KB • ${file.mime_type} • Storage: ${file.storage_status} • AI: ${file.ai_indexing_status}` : `Note • ${note?.created_at ? new Date(note.created_at).toLocaleDateString() : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {file?.file_type === "HTML" && (
              <>
                <Button size="sm" variant={viewMode === "preview" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setViewMode("preview")}>
                  Preview
                </Button>
                <Button size="sm" variant={viewMode === "source" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setViewMode("source")}>
                  Source
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAskAI}>
              <MessageSquare className="w-3 h-3 mr-1" />
              Ask AI
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onPin}>
              <Pin className="w-3 h-3 mr-1" />
              Pin
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onDownload}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          {file && (
            <>
              {file.file_type === "PDF" && (
                <div className="space-y-3">
                  <div className="p-8 rounded-lg bg-secondary text-center">
                    <p className="text-[48px]">📑</p>
                    <p className="text-sm font-medium mt-2">PDF Preview</p>
                    <p className="text-xs text-muted-foreground mt-1">Page count where available, metadata, file size, upload date</p>
                    <p className="text-xs text-muted-foreground mt-2">In real implementation: PDF viewer with page navigation, text extraction optional separate from storage</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <Button size="sm">Open</Button>
                      <Button size="sm" variant="outline" onClick={onDownload}>
                        Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={onAskAI}>
                        Add to AI Context
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Storage: {file.storage_status} • AI Indexing: {file.ai_indexing_status} • PDF should still work as normal stored file even when AI indexing disabled</p>
                </div>
              )}

              {file.file_type === "HTML" && (
                <div className="space-y-3">
                  {viewMode === "source" ? (
                    <pre className="p-4 rounded-lg bg-secondary text-xs overflow-auto max-h-[60vh]">{"<html> <!-- Source view -->\n<head><title>Concept</title></head>\n<body>\n  <h1>HTML Concepts</h1>\n  <p>Safe preview — sandboxed iframe, never execute untrusted HTML in main origin</p>\n</body>\n</html>"}</pre>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        Security: Sandboxed iframe with sandbox attribute without allow-same-origin — prevents access to tokens/cookies/session/APIs/Supabase creds/other users data — Treat uploaded HTML as untrusted content
                      </div>
                      <iframe
                        sandbox="allow-scripts"
                        srcDoc="<html><body><h1>HTML Preview (Sandboxed)</h1><p>This is safe preview — isolated iframe, no access to parent origin</p></body></html>"
                        className="w-full h-[60vh] rounded-lg border bg-white"
                        title="HTML Preview Sandboxed"
                      />
                    </div>
                  )}
                </div>
              )}

              {file.file_type === "VIDEO" && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-black aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-[48px]">🎥</p>
                      <p className="text-sm mt-2">Video Player</p>
                      <p className="text-xs text-white/70 mt-1">MP4/MKV/MOV/WebM/AVI — streaming where codec supported</p>
                      <p className="text-xs text-white/70">Duration where extractable, thumbnail where feasible</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-secondary text-xs">
                    <p>If browser cannot play MKV: Preview unavailable in this browser [Download Video] — not corrupted</p>
                    <p>Large videos: streaming, not loading entire file into RAM, upload progress pause/cancel/resume where feasible</p>
                  </div>
                </div>
              )}

              {file.file_type === "AUDIO" && (
                <div className="space-y-3">
                  <div className="p-6 rounded-lg bg-secondary text-center">
                    <p className="text-[48px]">🎧</p>
                    <p className="text-sm font-medium mt-2">Audio Player</p>
                    <p className="text-xs text-muted-foreground mt-1">MP3/WAV/M4A/AAC/OGG/FLAC — Play/Pause/Seek</p>
                    <div className="mt-4 flex items-center gap-2 justify-center">
                      <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-indigo-600" />
                      </div>
                      <span className="text-xs">1:23 / 4:56</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration, metadata, upload date, file size — Optional: Transcribe, Summarize, Ask AI, Generate Notes — explicit actions, not automatic</p>
                </div>
              )}

              {file.file_type === "IMAGES" && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-secondary aspect-video flex items-center justify-center">
                    <p className="text-[48px]">🖼</p>
                  </div>
                  <p className="text-xs text-muted-foreground">JPG/JPEG/PNG/WEBP/GIF/SVG secure handling — circuit diagrams, engineering drawings, screenshots, references — Optional analysis separate — storage and AI interpretation separate</p>
                </div>
              )}

              {file.file_type === "DOCUMENTS" || file.file_type === "OTHER" || file.file_type === "DATA" ? (
                <div className="space-y-3">
                  <div className="p-8 rounded-lg bg-secondary text-center">
                    <p className="text-[48px]">📄</p>
                    <p className="text-sm font-medium mt-2">Document Preview</p>
                    <p className="text-xs text-muted-foreground mt-1">DOCX/TXT/Markdown/RTF/ODT where supported — Preview where supported + Download</p>
                    <p className="text-xs text-muted-foreground">Features: Rename/Delete/Move/Copy/Folder/Sort/Search/Tags/Metadata/Last modified/Size/Upload date</p>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {note && (
            <div className="prose prose-sm max-w-none">
              <h3 className="text-[16px] font-bold">{note.title}</h3>
              <p className="text-xs text-muted-foreground">{note.tags || "No tags"} • {new Date(note.created_at).toLocaleDateString()}</p>
              <div className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed">{note.content}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
