import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { itemCreateSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);

  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const itemClass = url.searchParams.get("itemClass") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  type WhereClause = {
    ownerId: string;
    category?: string;
    itemClass?: string;
    name?: { contains: string; mode: "insensitive" };
    OR?: Array<{
      expirationDate?: { lt?: Date; gte?: Date; lte?: Date };
      renewalDate?: { lt?: Date; gte?: Date; lte?: Date };
    }>;
  };

  const where: WhereClause = { ownerId: user.id };
  if (category) where.category = category;
  if (itemClass) where.itemClass = itemClass;
  if (search) where.name = { contains: search, mode: "insensitive" };

  if (status === "expired") {
    where.OR = [
      { expirationDate: { lt: now } },
      { renewalDate: { lt: now } },
    ];
  } else if (status === "expiring") {
    where.OR = [
      { expirationDate: { gte: now, lte: thirtyDaysFromNow } },
      { renewalDate: { gte: now, lte: thirtyDaysFromNow } },
    ];
  } else if (status === "active") {
    where.OR = [
      { expirationDate: { gte: thirtyDaysFromNow } },
      { renewalDate: { gte: thirtyDaysFromNow } },
    ];
  }

  const items = await db.item.findMany({
    where,
    include: { itemType: true },
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
    return error("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const result = itemCreateSchema.safeParse(body);
  if (!result.success) {
    return error("VALIDATION_ERROR", "Invalid input", 400, result.error.issues);
  }

  const {
    name,
    type,
    category,
    itemClass,
    itemTypeId,
    expirationDate,
    documentNumber,
    renewalDate,
    billingCycle,
    price,
    notes,
    dynamicFields,
    reminderDaysBefore,
  } = result.data;

  const item = await db.item.create({
    data: {
      ownerId: user.id,
      name,
      type,
      category,
      itemClass,
      itemTypeId,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      documentNumber,
      renewalDate: renewalDate ? new Date(renewalDate) : undefined,
      billingCycle,
      price,
      notes,
      dynamicFields: dynamicFields != null ? (dynamicFields as Prisma.InputJsonValue) : undefined,
      reminderDaysBefore,
    },
    include: { itemType: true },
  });

  return success(item, 201);
}

