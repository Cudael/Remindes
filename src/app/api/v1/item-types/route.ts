import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { itemTypeCreateSchema } from "@/lib/schemas";
import { db } from "@/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const itemClass = url.searchParams.get("itemClass") ?? undefined;

  const itemTypes = await db.itemType.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
      ...(itemClass && { itemClass }),
    },
    orderBy: { name: "asc" },
  });

  return success(itemTypes);
}

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

  const result = itemTypeCreateSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const { name, category, itemClass, description, icon, fieldsConfig, isActive } = result.data;

  const itemType = await db.itemType.create({
    data: { name, category, itemClass, description, icon, fieldsConfig, isActive },
  });

  return success(itemType, 201);
}

