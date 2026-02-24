import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { attachItemFileSchema } from "@/lib/schemas";
import { db } from "@/server/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);
  const { id } = await params;

  const item = await db.item.findUnique({ where: { id } });

  if (!item) {
    return error("NOT_FOUND", "Item not found", 404);
  }

  if (item.ownerId !== user.id) {
    return error("FORBIDDEN", "You do not own this item", 403);
  }

  const attachments = await db.itemAttachment.findMany({
    where: { itemId: id },
    include: { file: true },
    orderBy: { createdAt: "desc" },
  });

  return success(attachments);
}

export async function POST(req: Request, { params }: Params) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);
  const { id } = await params;

  const item = await db.item.findUnique({ where: { id } });

  if (!item) {
    return error("NOT_FOUND", "Item not found", 404);
  }

  if (item.ownerId !== user.id) {
    return error("FORBIDDEN", "You do not own this item", 403);
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return error("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const result = attachItemFileSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const file = await db.file.findUnique({ where: { id: result.data.fileId } });

  if (!file) {
    return error("NOT_FOUND", "File not found", 404);
  }

  if (file.ownerId !== user.id) {
    return error("FORBIDDEN", "You do not own this file", 403);
  }

  const existing = await db.itemAttachment.findUnique({
    where: { itemId_fileId: { itemId: id, fileId: file.id } },
  });

  if (existing) {
    return error("CONFLICT", "File is already attached to this item", 409);
  }

  const attachment = await db.itemAttachment.create({
    data: { itemId: id, fileId: file.id },
    include: { file: true },
  });

  return success(attachment, 201);
}
