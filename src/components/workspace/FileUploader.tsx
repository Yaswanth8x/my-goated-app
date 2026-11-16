"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, X, File, AlertCircle, CheckCircle } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  blockType?: string;
}

export function FileUploader({ onFilesSelected, accept, multiple = true, maxSizeBytes, blockType }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Validate
    if (maxSizeBytes) {
      const tooLarge = files.filter((f) => f.size > maxSizeBytes);
      if (tooLarge.length > 0) {
        setError(`File too large: ${tooLarge[0].name} is ${(tooLarge[0].size / 1024 / 1024).toFixed(2)}MB > ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB`);
        return;
      }
    }

    onFilesSelected(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (maxSizeBytes) {
      const tooLarge = files.filter((f) => f.size > maxSizeBytes);
      if (tooLarge.length > 0) {
        setError(`File too large: ${tooLarge[0].name} is ${(tooLarge[0].size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
    }

    onFilesSelected(files);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer
          ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-muted-foreground/25 hover:border-indigo-300 hover:bg-secondary/50"}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} onChange={handleFileInput} className="hidden" />

        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDragging ? "bg-indigo-600 text-white" : "bg-secondary"}`}>
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-medium">
              {isDragging ? "Drop files here" : `Drag files here or click to upload${blockType ? ` to ${blockType}` : ""}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept ? `Accepts: ${accept}` : "All file types supported"} • {multiple ? "Multiple files" : "Single file"} • Max {(maxSizeBytes || 100 * 1024 * 1024) / 1024 / 1024}MB
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs mt-1" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            <Upload className="w-3 h-3 mr-1" />
            Upload Files
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setError(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Upload progress item
export function UploadProgressItem({ filename, progress, status, error }: { filename: string; progress: number; status: "uploading" | "success" | "failed"; error?: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-card text-[13px]">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        {status === "success" ? <CheckCircle className="w-4 h-4 text-green-600" /> : status === "failed" ? <AlertCircle className="w-4 h-4 text-red-600" /> : <File className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{filename}</p>
        {status === "uploading" && (
          <div className="mt-1 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {status === "failed" && error && <p className="text-xs text-red-600 truncate">{error}</p>}
        {status === "success" && <p className="text-xs text-green-600">Upload successful</p>}
      </div>
      <span className="text-xs text-muted-foreground">{status === "uploading" ? `${progress}%` : status}</span>
    </div>
  );
}
