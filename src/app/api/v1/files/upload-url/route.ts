import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { fileUploadUrlSchema } from "@/lib/schemas";
import { createPresignedUploadUrl } from "@/server/r2";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  await getOrCreateDbUser(userId);

  const body = await req.json().catch(() => null);
  if (!body) {
    return error("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const result = fileUploadUrlSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const { mimeType, size } = result.data;
  const ext = mimeType.split("/")[1];
  const storageKey = `uploads/${randomUUID()}.${ext}`;

  const uploadUrl = await createPresignedUploadUrl(storageKey, mimeType, size);

  return success({ storageKey, uploadUrl });
}
