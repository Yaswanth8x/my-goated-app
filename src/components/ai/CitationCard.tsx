"use client";

import { Citation } from "@/lib/ai/types";

interface CitationCardProps {
  citations: Citation[];
}

export function CitationCard({ citations }: CitationCardProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-lg border bg-secondary/50">
      <p className="text-xs font-medium mb-2">📚 Citations — Sources from your documents (never fabricated)</p>
      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <div key={idx} className="text-xs p-2 rounded bg-card border">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-700">[{idx + 1}]</span>
              <span className="font-medium">{citation.document_title || citation.source}</span>
            </div>
            <div className="text-muted-foreground mt-1">
              {citation.page && <span>Page {citation.page} • </span>}
              {citation.section && <span>Section: {citation.section} • </span>}
              <span>Source: {citation.source}</span>
            </div>
            {citation.excerpt && (
              <div className="mt-1 p-1.5 rounded bg-secondary text-[11px] italic">"{citation.excerpt}"</div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">Citations are from RAG retrieval — filtered by course_id and similarity. Never fabricated.</p>
    </div>
  );
}
