import { z } from "zod/v4";

// ── Item DTOs ───────────────────────────────────────────────

export const itemCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
});

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;

export const itemUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.string().optional(),
});

export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;

// ── Item Attachment DTO ──────────────────────────────────────

export const attachItemFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

export type AttachItemFileInput = z.infer<typeof attachItemFileSchema>;

// ── File metadata DTO ───────────────────────────────────────

export const fileMetadataSchema = z.object({
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().int().positive("Size must be a positive integer"),
});

export type FileMetadataInput = z.infer<typeof fileMetadataSchema>;

// ── File upload-url request ─────────────────────────────────

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const fileUploadUrlSchema = z.object({
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Allowed types: application/pdf, image/jpeg, image/png, image/webp",
  }),
  size: z
    .number()
    .int()
    .positive("Size must be a positive integer")
    .max(MAX_FILE_SIZE, "File size must not exceed 10 MB"),
});

export type FileUploadUrlInput = z.infer<typeof fileUploadUrlSchema>;

// ── File complete request ───────────────────────────────────

export const fileCompleteSchema = z.object({
  storageKey: z.string().min(1, "Storage key is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Allowed types: application/pdf, image/jpeg, image/png, image/webp",
  }),
  size: z
    .number()
    .int()
    .positive("Size must be a positive integer")
    .max(MAX_FILE_SIZE, "File size must not exceed 10 MB"),
});

export type FileCompleteInput = z.infer<typeof fileCompleteSchema>;
