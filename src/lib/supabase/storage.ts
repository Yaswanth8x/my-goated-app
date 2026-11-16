import { getSupabaseBrowserClient } from "./client";
import { logger } from "@/lib/logger";

// ============================================================
// File Storage Architecture — Workspace 1 Part 23
// ============================================================

export type BucketName = "documents" | "avatars" | "project-assets" | "portfolio" | "course-materials";

export const BUCKETS: Record<BucketName, { public: boolean; description: string }> = {
  documents: { public: false, description: "Private user documents, RLS by user_id folder" },
  avatars: { public: true, description: "User avatars, public read" },
  "project-assets": { public: false, description: "Project assets, private" },
  portfolio: { public: false, description: "Portfolio items, private" },
  "course-materials": { public: false, description: "Course materials, private" },
};

export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File,
  userId: string
): Promise<{ data?: any; error?: any }> {
  const supabase = getSupabaseBrowserClient();

  // Validate
  if (!file) {
    return { error: { message: "No file provided" } };
  }

  // File size limit: 10MB for documents, 5MB for avatars
  const maxSize = bucket === "avatars" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: { message: `File too large. Max ${maxSize / 1024 / 1024}MB for ${bucket}` } };
  }

  // Validate type
  const allowedTypes: Record<BucketName, string[]> = {
    documents: ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/*"],
    avatars: ["image/jpeg", "image/png", "image/webp"],
    "project-assets": ["*/*"],
    portfolio: ["*/*"],
    "course-materials": ["application/pdf", "text/plain", "image/*"],
  };

  // For simplicity, allow all in this starter, but log
  logger.info(`Uploading file to ${bucket}/${userId}/${path}`, { size: file.size, type: file.type });

  // Path should include user_id for RLS: user_id/filename
  const fullPath = `${userId}/${path}`;

  const { data, error } = await supabase.storage.from(bucket).upload(fullPath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    logger.error(`Upload failed for ${bucket}/${fullPath}`, { error: error.message });
    return { error };
  }

  logger.info(`Upload succeeded: ${bucket}/${fullPath}`);
  return { data };
}

export async function getFileUrl(bucket: BucketName, path: string, userId: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const fullPath = `${userId}/${path}`;

  // For public buckets, get public URL
  if (BUCKETS[bucket].public) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return data.publicUrl;
  }

  // For private buckets, create signed URL (valid 1 hour)
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fullPath, 3600);
  if (error) {
    logger.error(`Failed to create signed URL for ${bucket}/${fullPath}`, { error: error.message });
    return null;
  }
  return data.signedUrl;
}

export async function deleteFile(bucket: BucketName, path: string, userId: string) {
  const supabase = getSupabaseBrowserClient();
  const fullPath = `${userId}/${path}`;

  const { error } = await supabase.storage.from(bucket).remove([fullPath]);
  if (error) {
    logger.error(`Delete failed for ${bucket}/${fullPath}`, { error: error.message });
    return { error };
  }
  logger.info(`Deleted ${bucket}/${fullPath}`);
  return { error: null };
}

export async function listFiles(bucket: BucketName, userId: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.storage.from(bucket).list(userId, {
    limit: 100,
    offset: 0,
  });

  if (error) {
    logger.error(`List failed for ${bucket}/${userId}`, { error: error.message });
    return { data: [], error };
  }

  return { data, error: null };
}
