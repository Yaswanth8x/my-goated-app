import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkText } from "@/lib/rag/chunk";
import { embedText } from "@/lib/rag/embed";
import { addChunksToMemory } from "@/lib/rag/retrieve";
import { logger } from "@/lib/logger";

// ============================================================
// Document Upload API — RAG Ingestion
// Workspace 2 Part 47
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const course_id = formData.get("course_id") as string;
    const unit_id = formData.get("unit_id") as string;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            what: "No file provided",
            why: "FormData must include file",
            what_to_do: "Select a file (PDF, DOCX, TXT, etc.) and try again",
          },
        },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: {
            what: "File too large",
            why: `File size ${file.size} exceeds ${maxSize} limit`,
            what_to_do: "Upload smaller file (<10MB) or split into parts",
          },
        },
        { status: 400 }
      );
    }

    // Get user
    const supabase = await createClient();
    let userId = "mock-user";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // mock mode
    }

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    // Simple extraction based on type
    const fileType = file.type;
    const fileName = file.name;

    if (fileType.includes("text") || fileName.endsWith(".txt") || fileName.endsWith(".csv")) {
      text = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      // For MVP, try to read as text — if PDF is text-based, this might work partially
      // Real implementation would use pdf-parse
      // For now, if buffer starts with %PDF, we can't parse, ask user to upload extracted text
      const header = buffer.slice(0, 4).toString();
      if (header === "%PDF") {
        // Try to extract text roughly — look for text between BT and ET (PDF text operators)
        // This is very naive, but for MVP we return placeholder and ask for text upload
        text = buffer.toString("utf-8").slice(0, 50000);
        // If text is mostly binary, fallback
        const readableChars = text.replace(/[^\x20-\x7E\n\r]/g, "").length;
        const ratio = readableChars / text.length;
        if (ratio < 0.5) {
          return NextResponse.json(
            {
              error: {
                what: "PDF parsing not fully implemented",
                why: "PDF appears to be binary/scanned, not text-extracted",
                what_to_do: "For now, upload UTF-8 text extracted from PDF (as noted in old README). Real PDF parsing with pdf-parse will be added. Or use TXT version.",
              },
            },
            { status: 400 }
          );
        }
      } else {
        text = buffer.toString("utf-8");
      }
    } else {
      // For other types, try utf-8
      text = buffer.toString("utf-8").slice(0, 100000);
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        {
          error: {
            what: "Could not extract text",
            why: "File content too short or not readable",
            what_to_do: "Ensure file is text-based, or upload TXT version",
          },
        },
        { status: 400 }
      );
    }

    // Chunk
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chunks = chunkText(text, {
      user_id: userId,
      document_id: documentId,
      course_id: course_id || undefined,
      unit_id: unit_id || undefined,
      source: fileName,
      chunkSize: 2000,
      overlap: 200,
    });

    logger.info(`Chunked document ${fileName} into ${chunks.length} chunks`, { user_id: userId, course_id });

    // Embed chunks (mock for now)
    const storedChunks = [];

    for (const chunk of chunks) {
      try {
        const embedding = await embedText(chunk.content, { provider: "mock" });

        const storedChunk = {
          id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${chunk.chunk_index}`,
          document_id: documentId,
          document_title: title || fileName,
          content: chunk.content,
          embedding,
          user_id: userId,
          course_id: course_id || undefined,
          unit_id: unit_id || undefined,
          page: chunk.page,
          section: chunk.section,
          created_at: new Date().toISOString(),
        };

        storedChunks.push(storedChunk);
      } catch (error) {
        logger.warn(`Failed to embed chunk ${chunk.chunk_index}`, { error: String(error) });
      }
    }

    // Store in memory (mock), in production would be Supabase with pgvector
    addChunksToMemory(storedChunks);

    logger.info(`Stored ${storedChunks.length} chunks for document ${documentId}`);

    // TODO: Save document metadata to Supabase documents table
    // const { data, error } = await supabase.from('documents').insert({
    //   id: documentId,
    //   user_id: userId,
    //   course_id,
    //   unit_id,
    //   title: title || fileName,
    //   type: fileType,
    //   file_path: `${userId}/${fileName}`,
    //   bucket: 'documents',
    //   size: file.size,
    //   status: 'READY'
    // })

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        title: title || fileName,
        fileName,
        size: file.size,
        type: fileType,
        course_id,
        unit_id,
        chunks: chunks.length,
        embedded: storedChunks.length,
        status: "READY",
      },
      chunks: storedChunks.slice(0, 3).map((c) => ({ id: c.id, content: c.content.slice(0, 200), page: c.page })), // preview first 3
      message: `Document uploaded, chunked into ${chunks.length}, embedded ${storedChunks.length}. Ready for RAG. Ask questions about it in AI Hub with course filter.`,
    });
  } catch (error) {
    logger.error("Document upload failed", { error: String(error) });
    return NextResponse.json(
      {
        error: {
          what: "Document upload failed",
          why: error instanceof Error ? error.message : String(error),
          what_to_do: "Check file type (PDF text, TXT, CSV), size (<10MB), and try again. For PDFs, upload text-extracted version for now.",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Document upload API — POST with FormData: file, course_id, unit_id, title",
    supported_types: ["PDF (text-extracted for now)", "TXT", "CSV", "DOCX (text)"],
    max_size: "10MB",
    pipeline: "UPLOAD → EXTRACT → CLEAN → CHUNK → METADATA → EMBED → STORE → RETRIEVE → RERANK → LLM → ANSWER → CITATIONS",
  });
}
