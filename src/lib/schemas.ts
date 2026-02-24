import { z } from "zod/v4";

// ── Item Type DTOs ──────────────────────────────────────────

export const fieldConfigSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["text", "date", "number", "select", "textarea"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export type FieldConfig = z.infer<typeof fieldConfigSchema>;

export const itemTypeCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  itemClass: z.enum(["document", "subscription"]),
  description: z.string().optional(),
  icon: z.string().optional(),
  fieldsConfig: z.array(fieldConfigSchema).default([]),
  isActive: z.boolean().default(true),
});

export type ItemTypeCreateInput = z.infer<typeof itemTypeCreateSchema>;

// ── Item DTOs ───────────────────────────────────────────────

export const itemCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  category: z.string().optional(),
  itemClass: z.enum(["document", "subscription"]).optional(),
  itemTypeId: z.string().optional(),
  expirationDate: z.string().datetime().optional(),
  documentNumber: z.string().optional(),
  renewalDate: z.string().datetime().optional(),
  billingCycle: z.enum(["monthly", "yearly", "quarterly", "weekly"]).optional(),
  price: z.number().min(0).optional(),
  notes: z.string().optional(),
  dynamicFields: z.record(z.string(), z.unknown()).optional(),
  reminderDaysBefore: z.number().int().min(0).max(365).optional(),
});

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;

export const itemUpdateSchema = itemCreateSchema.partial();

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
