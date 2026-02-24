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

  const files = await db.file.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return success(files);
}
