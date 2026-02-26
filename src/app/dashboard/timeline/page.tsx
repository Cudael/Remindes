import { requireUser, getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";
import TimelineClient from "./timeline-client";

export default async function TimelinePage() {
  const clerkUserId = await requireUser();
  const user = await getOrCreateDbUser(clerkUserId);

  const items = await db.item.findMany({
    where: { ownerId: user.id },
    include: { itemType: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const serializedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    itemClass: item.itemClass,
    itemType: item.itemType
      ? {
          name: item.itemType.name,
          icon: item.itemType.icon,
          category: item.itemType.category,
        }
      : null,
    expirationDate: item.expirationDate?.toISOString() ?? null,
    renewalDate: item.renewalDate?.toISOString() ?? null,
  }));

  return <TimelineClient initialItems={serializedItems} />;
}
