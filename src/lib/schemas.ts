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

// ── File metadata DTO ───────────────────────────────────────

export const fileMetadataSchema = z.object({
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().int().positive("Size must be a positive integer"),
});

export type FileMetadataInput = z.infer<typeof fileMetadataSchema>;
