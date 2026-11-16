// ============================================================
// RAG — Chunking with metadata
// Workspace 2 Part 47
// ============================================================

export interface ChunkOptions {
  chunkSize?: number; // tokens ~ chars/4, default 500 tokens ~ 2000 chars
  overlap?: number; // overlap between chunks
  preservePages?: boolean;
}

export interface DocumentChunk {
  content: string;
  chunk_index: number;
  page?: number;
  section?: string;
  metadata: {
    user_id: string;
    document_id: string;
    course_id?: string;
    unit_id?: string;
    topic_id?: string;
    document_version?: string;
    source: string;
    page?: number;
    section?: string;
    created_at: string;
  };
}

export function chunkText(
  text: string,
  options: ChunkOptions & {
    user_id: string;
    document_id: string;
    course_id?: string;
    unit_id?: string;
    topic_id?: string;
    source: string;
  }
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 2000; // chars, ~500 tokens
  const overlap = options.overlap || 200; // chars overlap
  const { user_id, document_id, course_id, unit_id, topic_id, source } = options;

  // Simple chunking by paragraphs first, then by size
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const chunks: DocumentChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;
  let currentPage = 1;

  // Try to detect page numbers if text contains "Page X"
  const pageRegex = /Page\s+(\d+)/i;

  for (const paragraph of paragraphs) {
    // Check for page marker
    const pageMatch = paragraph.match(pageRegex);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
    }

    if ((currentChunk + "\n\n" + paragraph).length <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      // Save current chunk
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          chunk_index: chunkIndex++,
          page: currentPage,
          metadata: {
            user_id,
            document_id,
            course_id,
            unit_id,
            topic_id,
            source,
            page: currentPage,
            created_at: new Date().toISOString(),
          },
        });

        // Overlap: keep last `overlap` chars for next chunk
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + "\n\n" + paragraph;
      } else {
        // Paragraph itself larger than chunkSize, split by sentences
        const sentences = paragraph.split(/\. +/).filter((s) => s.trim());
        let sentenceChunk = "";
        for (const sentence of sentences) {
          if ((sentenceChunk + " " + sentence).length <= chunkSize) {
            sentenceChunk += (sentenceChunk ? " " : "") + sentence;
          } else {
            if (sentenceChunk.trim()) {
              chunks.push({
                content: sentenceChunk.trim(),
                chunk_index: chunkIndex++,
                page: currentPage,
                metadata: {
                  user_id,
                  document_id,
                  course_id,
                  unit_id,
                  topic_id,
                  source,
                  page: currentPage,
                  created_at: new Date().toISOString(),
                },
              });
            }
            sentenceChunk = sentence;
          }
        }
        if (sentenceChunk.trim()) {
          currentChunk = sentenceChunk;
        }
      }
    }
  }

  // Save last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunk_index: chunkIndex,
      page: currentPage,
      metadata: {
        user_id,
        document_id,
        course_id,
        unit_id,
        topic_id,
        source,
        page: currentPage,
        created_at: new Date().toISOString(),
      },
    });
  }

  return chunks;
}

// For PDF/DOCX extraction, we would have extractText function
// For now, placeholder that just returns text as is
// In production, use pdf-parse, mammoth, etc.

export function extractTextFromFileType(fileType: string, buffer: Buffer | string): string {
  const text = typeof buffer === "string" ? buffer : buffer.toString("utf-8");

  // For now, we only support text extraction from PDFs if they are actually text (not scanned)
  // Real implementation would use:
  // - PDF: pdf-parse or pdfjs-dist
  // - DOCX: mammoth
  // - PPTX: pptx parser
  // - TXT/CSV: direct
  // - Images: OCR via vision model or tesseract

  switch (fileType.toLowerCase()) {
    case "pdf":
      // Placeholder: If PDF is actually text-based, this might work, but scanned PDFs need OCR
      // For MVP, we ask user to upload UTF-8 text extracted from PDFs (as noted in old README)
      return text.slice(0, 100000); // limit
    case "docx":
    case "pptx":
      return text.slice(0, 100000);
    case "txt":
    case "csv":
      return text.slice(0, 100000);
    case "image":
      return `[Image content — vision model needed for analysis. In real RAG, this would be analyzed by vision-capable model.]`;
    default:
      return text.slice(0, 100000);
  }
}
