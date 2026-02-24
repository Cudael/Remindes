import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { itemUpdateSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await getOrCreateDbUser(userId);
  const { id } = await params;

  const item = await db.item.findUnique({
    where: { id },
    include: {
      itemType: true,
      attachments: { include: { file: true } },
    },
  });

  if (!item) {
    return error("NOT_FOUND", "Item not found", 404);
  }

  if (item.ownerId !== user.id) {
    return error("FORBIDDEN", "You do not own this item", 403);
  }

  return success(item);
}

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
    return error("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const result = itemUpdateSchema.safeParse(body);
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

  const updateData: Prisma.ItemUncheckedUpdateInput = {};

  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (category !== undefined) updateData.category = category;
  if (itemClass !== undefined) updateData.itemClass = itemClass;
  if (itemTypeId !== undefined) updateData.itemTypeId = itemTypeId ?? null;
  if (expirationDate !== undefined)
    updateData.expirationDate = expirationDate ? new Date(expirationDate) : null;
  if (documentNumber !== undefined) updateData.documentNumber = documentNumber;
  if (renewalDate !== undefined)
    updateData.renewalDate = renewalDate ? new Date(renewalDate) : null;
  if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
  if (price !== undefined) updateData.price = price;
  if (notes !== undefined) updateData.notes = notes;
  if (dynamicFields !== undefined) updateData.dynamicFields = dynamicFields as Prisma.InputJsonValue;
  if (reminderDaysBefore !== undefined) updateData.reminderDaysBefore = reminderDaysBefore;

  const updated = await db.item.update({
    where: { id },
    data: updateData,
    include: { itemType: true },
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

