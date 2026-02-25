import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Plus, Layers, AlertTriangle, CalendarClock, XCircle, FileText, RefreshCw } from "lucide-react";

import { requireUser, getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";
import { getItemStatus } from "@/lib/item-utils";

import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentlyAddedPanel } from "@/components/dashboard/recently-added-panel";
import { ActionRequiredPanel } from "@/components/dashboard/action-required-panel";
import { CategoryDistributionPanel } from "@/components/dashboard/category-distribution-panel";
import { UpcomingTimelinePanel } from "@/components/dashboard/upcoming-timeline-panel";

function getInitials(
  firstName: string | null,
  lastName: string | null,
  email: string | null
): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export default async function Dashboard() {
  const clerkUserId = await requireUser();
  const user = await getOrCreateDbUser(clerkUserId);
  const clerkUser = await currentUser();

  const items = await db.item.findMany({
    where: { ownerId: user.id },
    include: {
      itemType: true,
      _count: { select: { attachments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let expiringSoon = 0;
  let expired = 0;
  let activeSubscriptions = 0;

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
      }
    }
  }

  // Items expiring within 30 days (upcoming timeline)
  const upcomingItems = items
    .filter((item) => {
      const d = item.expirationDate ?? item.renewalDate;
      if (!d) return false;
      return d >= now && d <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      const da = a.expirationDate ?? a.renewalDate ?? now;
      const db2 = b.expirationDate ?? b.renewalDate ?? now;
      return new Date(da).getTime() - new Date(db2).getTime();
    })
    .slice(0, 8);

  const recentItems = items.slice(0, 4);
  const totalItems = items.length;

  // Extended computed values
  const thisWeek = items.filter((item) => {
    const d = item.expirationDate ?? item.renewalDate;
    if (!d) return false;
    return d >= now && d <= sevenDaysFromNow;
  }).length;

  const documents = items.filter((item) => item.itemClass === "document").length;
  const subscriptions = items.filter((item) => item.itemClass === "subscription").length;
  const missingAttachments = items.filter((item) => item._count.attachments === 0).length;

  const focusMessage =
    expired > 0
      ? "You have expired items that need immediate attention."
      : expiringSoon > 0
        ? "You have items expiring soon—review them before deadlines hit."
        : missingAttachments > 0
          ? "Some items are missing attachments. Upload files to keep records complete."
          : "Great job—your vault is healthy and up to date.";

  // Notification items for the top bar bell
  const notificationItems = upcomingItems.map((item) => {
    const { urgency } = getItemStatus(item);
    return {
      id: item.id,
      name: item.name,
      expirationDate: item.expirationDate,
      renewalDate: item.renewalDate,
      urgency,
    };
  });

  // User display info
  const firstName = clerkUser?.firstName ?? null;
  const lastName = clerkUser?.lastName ?? null;
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const userName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName ?? userEmail ?? "User";
  const userInitials = getInitials(firstName, lastName, userEmail || null);
  const userImageUrl = clerkUser?.imageUrl ?? null;
  const isPremium = clerkUser?.publicMetadata?.plan === "premium";

  // Time-based greeting
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <DashboardTopBar
        pageTitle="Overview"
        notificationItems={notificationItems}
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        userImageUrl={userImageUrl}
        isPremium={isPremium}
      />

      {/* Ambient background grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-8 pb-12 px-4 sm:px-6 lg:px-8 mt-6">
        {/* Greeting & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                {firstName ?? userName.split(" ")[0]}.
              </span>
            </h1>
            <p className="mt-2 text-base text-slate-400">
              {totalItems === 0
                ? "Your vault is empty. Add your first item to get started."
                : `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} in your vault.`}
            </p>
            {totalItems > 0 && (
              <p className="mt-2 text-sm text-slate-500">{focusMessage}</p>
            )}
          </div>
          <Link
            href="/dashboard/items/new"
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="Add new item"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden="true" />
            Add New Item
          </Link>
        </div>

        {/* 12-column bento grid */}
        <div className="grid grid-cols-12 gap-5 lg:gap-6">
          {/* Row 1: 6 stat cards */}
          <div className="col-span-6 md:col-span-4 xl:col-span-2">
            <StatCard
              label="Total Items"
              value={totalItems}
              icon={Layers}
              accentColor="teal"
              activitySummary="Documents & subscriptions"
              href="/dashboard/items"
            />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2">
            <StatCard
              label="Expiring Soon"
              value={expiringSoon}
              icon={AlertTriangle}
              accentColor="amber"
              activitySummary="Within 30 days"
              href="/dashboard/items?status=expiring"
            />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2">
            <StatCard
              label="This Week"
              value={thisWeek}
              icon={CalendarClock}
              accentColor="orange"
              activitySummary="Next 7 days"
              href="/dashboard/items?filter=timeline"
            />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2">
            <StatCard
              label="Expired"
              value={expired}
              icon={XCircle}
              accentColor="rose"
              isAlert={expired > 0}
              activitySummary="Need attention"
              href="/dashboard/items?status=expired"
            />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2">
            <StatCard
              label="Documents"
              value={documents}
              icon={FileText}
              accentColor="indigo"
              activitySummary="Stored documents"
              href="/dashboard/items?class=document"
            />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2">
            <StatCard
              label="Subscriptions"
              value={subscriptions}
              icon={RefreshCw}
              accentColor="emerald"
              activitySummary={`${activeSubscriptions} active`}
              href="/dashboard/items?class=subscription"
            />
          </div>

          {/* Row 2: Recently Added + Action Required */}
          <div className="col-span-12 lg:col-span-8">
            <RecentlyAddedPanel items={recentItems} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ActionRequiredPanel
              expired={expired}
              expiringSoon={expiringSoon}
              total={totalItems}
              missingAttachments={missingAttachments}
            />
          </div>

          {/* Row 3: Category Distribution + Upcoming Timeline */}
          <div className="col-span-12 lg:col-span-4">
            <CategoryDistributionPanel items={items} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <UpcomingTimelinePanel items={upcomingItems} />
          </div>
        </div>
      </div>
    </>
  );
}
