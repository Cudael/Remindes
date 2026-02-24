import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";

type Params = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);
  const { id, attachmentId } = await params;

  const item = await db.item.findUnique({ where: { id } });

  if (!item) {
    return error("NOT_FOUND", "Item not found", 404);
  }

  if (item.ownerId !== user.id) {
    return error("FORBIDDEN", "You do not own this item", 403);
  }

  const attachment = await db.itemAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    return error("NOT_FOUND", "Attachment not found", 404);
  }

  if (attachment.itemId !== id) {
    return error("NOT_FOUND", "Attachment not found", 404);
  }

  await db.itemAttachment.delete({ where: { id: attachmentId } });

  return success({ id: attachmentId });
}
