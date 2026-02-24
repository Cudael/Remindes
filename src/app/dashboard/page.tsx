import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { requireUser, getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";
import { getItemStatus, getCategoryIcon, formatCurrency } from "@/lib/item-utils";
import { Plus, FileText, RefreshCw, AlertTriangle } from "lucide-react";

export default async function Dashboard() {
  const clerkUserId = await requireUser();
  const user = await getOrCreateDbUser(clerkUserId);

  const items = await db.item.findMany({
    where: { ownerId: user.id },
    include: { itemType: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let expiringSoon = 0;
  let expired = 0;
  let activeSubscriptions = 0;
  let monthlySubscriptionCost = 0;

  for (const item of items) {
    const { status } = getItemStatus(item);
    if (status === "expired") expired++;
    else if (status === "expiring") expiringSoon++;

    if (item.itemClass === "subscription" && item.price != null) {
      const renewalDiff = item.renewalDate
        ? item.renewalDate.getTime() - now.getTime()
        : 1;
      if (renewalDiff > 0) {
        activeSubscriptions++;
        if (item.billingCycle === "monthly") monthlySubscriptionCost += item.price;
        else if (item.billingCycle === "yearly") monthlySubscriptionCost += item.price / 12;
        else if (item.billingCycle === "quarterly") monthlySubscriptionCost += item.price / 3;
        else if (item.billingCycle === "weekly") monthlySubscriptionCost += item.price * 4.33;
        else monthlySubscriptionCost += item.price;
      }
    }
  }

  // Items expiring within 30 days
  const upcomingItems = items
    .filter((item) => {
      const d = item.expirationDate ?? item.renewalDate;
      if (!d) return false;
      return d >= now && d <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      const da = (a.expirationDate ?? a.renewalDate)!;
      const db2 = (b.expirationDate ?? b.renewalDate)!;
      return new Date(da).getTime() - new Date(db2).getTime();
    })
    .slice(0, 5);

  const recentItems = items.slice(0, 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/items/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold mt-1">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className={`text-2xl font-bold mt-1 ${expiringSoon > 0 ? "text-yellow-600" : ""}`}>
              {expiringSoon}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className={`text-2xl font-bold mt-1 ${expired > 0 ? "text-red-600" : ""}`}>
              {expired}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Monthly Cost</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(Math.round(monthlySubscriptionCost * 100) / 100)}
            </p>
            <p className="text-xs text-muted-foreground">{activeSubscriptions} subscription{activeSubscriptions !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(expiringSoon > 0 || expired > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                {expired > 0 && (
                  <p className="text-red-700 font-medium">
                    {expired} item{expired !== 1 ? "s have" : " has"} expired.{" "}
                    <Link href="/dashboard/items?status=expired" className="underline">
                      View expired
                    </Link>
                  </p>
                )}
                {expiringSoon > 0 && (
                  <p className="text-yellow-700 mt-1">
                    {expiringSoon} item{expiringSoon !== 1 ? "s are" : " is"} expiring within 30 days.{" "}
                    <Link href="/dashboard/items?status=expiring" className="underline">
                      View expiring soon
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming expirations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Upcoming Expirations
            </CardTitle>
            <CardDescription>Next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing expiring in the next 30 days. 🎉
              </p>
            ) : (
              <ul className="space-y-2">
                {upcomingItems.map((item) => {
                  const d = item.expirationDate ?? item.renewalDate;
                  const daysLeft = d
                    ? Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  const cat = item.category ?? item.itemType?.category ?? "Other";
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/dashboard/items/${item.id}`}
                        className="flex items-center justify-between hover:bg-muted/50 rounded px-2 py-1.5 -mx-2 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(cat)}</span>
                          <span className="font-medium truncate max-w-[180px]">{item.name}</span>
                        </div>
                        <span className={`text-xs font-medium shrink-0 ml-2 ${
                          (daysLeft ?? 99) <= 7 ? "text-red-600" : "text-yellow-600"
                        }`}>
                          {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent items */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
            <CardDescription>
              <Link href="/dashboard/items" className="hover:underline">
                View all →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentItems.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No items yet.</p>
                <Button asChild size="sm">
                  <Link href="/dashboard/items/new">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add First Item
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentItems.map((item) => {
                  const cat = item.category ?? item.itemType?.category ?? "Other";
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/dashboard/items/${item.id}`}
                        className="flex items-center gap-2 hover:bg-muted/50 rounded px-2 py-1.5 -mx-2 transition-colors text-sm"
                      >
                        <span>{getCategoryIcon(cat)}</span>
                        <span className="font-medium truncate flex-1">{item.name}</span>
                        {item.itemClass === "subscription" ? (
                          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/items/new">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Add Document
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/items/new">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Add Subscription
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/items">
              View All Items
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

