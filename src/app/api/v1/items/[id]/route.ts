import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { itemUpdateSchema } from "@/lib/schemas";
import { db } from "@/server/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
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
    return error("BAD_REQUEST", "Invalid JSON body");
  }

  const result = itemUpdateSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const updated = await db.item.update({
    where: { id },
    data: result.data,
  });

  return success(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
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

  await db.item.delete({ where: { id } });

  return success({ id });
}
