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

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const items = await db.item.findMany({
    where: { ownerId: user.id },
    select: {
      category: true,
      itemClass: true,
      expirationDate: true,
      renewalDate: true,
      price: true,
      billingCycle: true,
    },
  });

  const total = items.length;

  const byCategory: Record<string, number> = {};
  const byClass: Record<string, number> = {};
  let expiringSoon = 0;
  let expired = 0;
  let activeSubscriptions = 0;
  let monthlySubscriptionCost = 0;

  for (const item of items) {
    // Category breakdown
    const cat = item.category ?? "Other";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;

    // Class breakdown
    const cls = item.itemClass ?? "document";
    byClass[cls] = (byClass[cls] ?? 0) + 1;

    // Expiration tracking
    const relevantDate = item.expirationDate ?? item.renewalDate;
    if (relevantDate) {
      const diff = relevantDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expired++;
      } else if (relevantDate <= thirtyDaysFromNow) {
        expiringSoon++;
      }
    }

    // Subscription cost
    if (item.itemClass === "subscription" && item.price != null) {
      const renewalDiff = item.renewalDate
        ? item.renewalDate.getTime() - now.getTime()
        : 1;
      if (renewalDiff > 0) {
        activeSubscriptions++;
        if (item.billingCycle === "monthly") {
          monthlySubscriptionCost += item.price;
        } else if (item.billingCycle === "yearly") {
          monthlySubscriptionCost += item.price / 12;
        } else if (item.billingCycle === "quarterly") {
          monthlySubscriptionCost += item.price / 3;
        } else if (item.billingCycle === "weekly") {
          monthlySubscriptionCost += item.price * 4.33;
        } else {
          monthlySubscriptionCost += item.price;
        }
      }
    }
  }

  return success({
    total,
    byCategory,
    byClass,
    expiringSoon,
    expired,
    activeSubscriptions,
    monthlySubscriptionCost: Math.round(monthlySubscriptionCost * 100) / 100,
  });
}
