import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return success(notifications);
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);

  const body = await req.json().catch(() => null);
  if (!body) {
    return error("BAD_REQUEST", "Invalid JSON body", 400);
  }

  // Mark notifications as read
  if (body.action === "markAllRead") {
    await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return success({ updated: true });
  }

  if (body.id) {
    const notification = await db.notification.findUnique({
      where: { id: body.id },
    });
    if (!notification || notification.userId !== user.id) {
      return error("NOT_FOUND", "Notification not found", 404);
    }
    const updated = await db.notification.update({
      where: { id: body.id },
      data: { isRead: true, readAt: new Date() },
    });
    return success(updated);
  }

  return error("BAD_REQUEST", "Invalid request body", 400);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    // Delete all read notifications
    await db.notification.deleteMany({
      where: { userId: user.id, isRead: true },
    });
    return success({ deleted: true });
  }

  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== user.id) {
    return error("NOT_FOUND", "Notification not found", 404);
  }

  await db.notification.delete({ where: { id } });
  return success({ id });
}
