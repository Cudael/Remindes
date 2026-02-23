import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { itemCreateSchema } from "@/lib/schemas";
import { db } from "@/server/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);

  const items = await db.item.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return success(items);
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);

  const body = await req.json().catch(() => null);
  if (!body) {
    return error("BAD_REQUEST", "Invalid JSON body");
  }

  const result = itemCreateSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const item = await db.item.create({
    data: {
      ownerId: user.id,
      name: result.data.name,
      type: result.data.type,
    },
  });

  return success(item, 201);
}
