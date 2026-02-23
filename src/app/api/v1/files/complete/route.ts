import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { fileCompleteSchema } from "@/lib/schemas";
import { db } from "@/server/db";

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

  const result = fileCompleteSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const existing = await db.file.findUnique({
    where: { storageKey: result.data.storageKey },
  });

  if (existing) {
    return error("CONFLICT", "File with this storage key already exists", 409);
  }

  const file = await db.file.create({
    data: {
      ownerId: user.id,
      storageKey: result.data.storageKey,
      originalName: result.data.originalName,
      mimeType: result.data.mimeType,
      size: result.data.size,
    },
  });

  return success(file, 201);
}
