import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";
import { createPresignedDownloadUrl } from "@/server/r2";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);
  const { id } = await params;

  const file = await db.file.findUnique({ where: { id } });

  if (!file) {
    return error("NOT_FOUND", "File not found", 404);
  }

  if (file.ownerId !== user.id) {
    return error("FORBIDDEN", "You do not own this file", 403);
  }

  const url = await createPresignedDownloadUrl(file.storageKey);

  return success({ url });
}
