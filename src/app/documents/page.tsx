"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getMemoryChunks, clearMemory } from "@/lib/rag/retrieve";
import { Upload, FileText, Trash2, BookOpen } from "lucide-react";

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [chunks, setChunks] = useState<any[]>([]);

  useEffect(() => {
    setChunks(getMemoryChunks());
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    if (courseId) formData.append("course_id", courseId);
    if (unitId) formData.append("unit_id", unitId);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(JSON.stringify(data.error, null, 2));
      } else {
        setResult(data);
        setChunks(getMemoryChunks());
        setFile(null);
        setTitle("");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear all in-memory chunks? (Mock mode)")) {
      clearMemory();
      setChunks([]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">DOCUMENTS — RAG Pipeline</h1>
        <p className="text-muted-foreground">Upload → Extract → Clean → Chunk → Metadata → Embed → Store → Retrieve → Rerank → LLM → Answer → Citations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document (Part 47)
          </CardTitle>
          <CardDescription>PDF (text-extracted for now), TXT, CSV — Max 10MB — Will be chunked and embedded for RAG</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-sm font-medium">File *</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.txt,.csv,.docx,.md"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">For PDFs, if binary/scanned, upload TXT extracted version for now (real PDF parsing coming). TXT works best for MVP.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., C Notes Unit 1"
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Course (for RAG filter)</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm">
                  <option value="">No course (general)</option>
                  <option value="CS3353">CS3353 - C Programming</option>
                  <option value="EC3352">EC3352 - Digital Systems Design</option>
                  <option value="EC3401">EC3401 - Networks and Security</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Unit (optional)</label>
              <input value={unitId} onChange={(e) => setUnitId(e.target.value)} placeholder="e.g., Unit 1" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
            </div>

            <Button type="submit" disabled={!file || uploading}>
              {uploading ? "Uploading & Embedding..." : "Upload & Ingest"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm whitespace-pre-wrap">
              <p className="font-medium">Upload failed:</p>
              <pre className="text-xs mt-1 overflow-auto">{error}</pre>
            </div>
          )}

          {result && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              <p className="font-medium">✅ {result.message}</p>
              <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">{JSON.stringify(result.document, null, 2)}</pre>
              {result.chunks && (
                <div className="mt-2">
                  <p className="font-medium">Preview chunks (first 3):</p>
                  {result.chunks.map((c: any, idx: number) => (
                    <div key={idx} className="mt-1 p-2 rounded bg-white border text-xs">
                      <p className="font-mono">Chunk {idx + 1} (Page {c.page || "N/A"}): {c.content}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stored Chunks — In-Memory (Mock) — {chunks.length} chunks
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          <CardDescription>For real production: Supabase with pgvector, not in-memory. Mock for testing RAG without DB.</CardDescription>
        </CardHeader>
        <CardContent>
          {chunks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No chunks yet. Upload a document above.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chunks.slice(-10).map((chunk: any, idx: number) => (
                <div key={chunk.id} className="p-2 rounded border text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{chunk.document_title}</span>
                    <span className="text-muted-foreground">Course: {chunk.course_id || "general"} • Page {chunk.page || "N/A"}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{chunk.content.slice(0, 200)}...</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            How to Test RAG + Citations (Parts 48-49)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Upload a TXT file with course notes (e.g., C programming notes) — select course CS3353</p>
          <p>2. Go to AI HUB → Select course CS3353 → Ask question about notes → Should retrieve relevant chunks</p>
          <p>3. Check citations in answer — should show SOURCE, DOCUMENT, PAGE, EXCERPT (never fabricated)</p>
          <p>4. Try with different course filter — should only retrieve chunks for that course</p>
          <p>5. Upload image (if vision model) — vision-capable models can analyze circuit diagrams, graphs, handwritten work</p>
          <p className="mt-2 text-muted-foreground">Current: Mock embeddings (hash vectors), in-memory storage. Real: OpenAI/Gemini embeddings + pgvector.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RAG Pipeline Details</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 font-mono bg-secondary p-3 rounded">
          <p>UPLOAD → EXTRACT → CLEAN → CHUNK → METADATA → EMBED → STORE → RETRIEVE → RERANK → LLM → ANSWER → CITATIONS</p>
          <p className="mt-2">Metadata per chunk: user_id, document_id, course_id, unit_id, topic_id, document_version, source, page, section, created_at</p>
          <p>Chunk: 2000 chars (~500 tokens) with 200 overlap</p>
          <p>Embed: Mock hash vectors (1536 dim) for now, real via OpenAI text-embedding-3-small or Gemini text-embedding-004</p>
          <p>Store: In-memory for mock, Supabase pgvector for real (CREATE EXTENSION vector)</p>
          <p>Retrieve: Cosine similarity, topK=5, threshold=0.1, filter by course_id</p>
          <p>Citations: SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT — never fabricate, validate exists in retrieved chunks</p>
        </CardContent>
      </Card>
    </div>
  );
}
