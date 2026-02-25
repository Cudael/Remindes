import { auth } from "@clerk/nextjs/server";
import { error, success } from "@/lib/api-response";
import { getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";
import { getItemStatus } from "@/lib/item-utils";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return error("UNAUTHORIZED", "Authentication required", 401);
  }

  const dbUser = await getOrCreateDbUser(userId);

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingItems = await db.item.findMany({
    where: {
      ownerId: dbUser.id,
      OR: [
        { expirationDate: { gte: now, lte: thirtyDaysFromNow } },
        { renewalDate: { gte: now, lte: thirtyDaysFromNow } },
      ],
    },
    take: 8,
  });

  const items = upcomingItems.map((item) => {
    const { urgency } = getItemStatus(item);
    return {
      id: item.id,
      name: item.name,
      expirationDate: item.expirationDate,
      renewalDate: item.renewalDate,
      urgency,
    };
  });

  return success(items);
}
