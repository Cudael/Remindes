import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Plus, Layers, AlertTriangle, CalendarClock, XCircle, FileText, RefreshCw, Info } from "lucide-react";

import { requireUser, getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";
import { getItemStatus } from "@/lib/item-utils";
import { cn } from "@/lib/utils";

import { StatCard } from "@/components/dashboard/stat-card";
import { RecentlyAddedPanel } from "@/components/dashboard/recently-added-panel";
import { ActionRequiredPanel } from "@/components/dashboard/action-required-panel";
import { CategoryDistributionPanel } from "@/components/dashboard/category-distribution-panel";
import { UpcomingTimelinePanel } from "@/components/dashboard/upcoming-timeline-panel";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";

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

  // User display info
  const firstName = clerkUser?.firstName ?? null;
  const lastName = clerkUser?.lastName ?? null;
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const userName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName ?? userEmail ?? "User";

  // Time-based greeting
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Determine Alert Banner State cleanly
  const hasAlerts = totalItems > 0 && (expired > 0 || expiringSoon > 0 || missingAttachments > 0);
  const alertType = expired > 0 ? "error" : expiringSoon > 0 ? "warning" : "info";

  const alertStyles = {
    error: {
      wrapper: "bg-red-50 border-red-100",
      iconWrapper: "bg-white border-red-100 shadow-sm",
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      title: "text-red-900",
      titleText: "Attention Required",
      text: "text-red-700",
      button: "bg-white border-red-200 text-red-700 hover:bg-red-50 focus-visible:ring-red-500 shadow-sm",
      link: "/dashboard/items?status=expired"
    },
    warning: {
      wrapper: "bg-amber-50 border-amber-100",
      iconWrapper: "bg-white border-amber-100 shadow-sm",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      title: "text-amber-900",
      titleText: "Upcoming Expirations",
      text: "text-amber-700",
      button: "bg-white border-amber-200 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500 shadow-sm",
      link: "/dashboard/items?status=expiring"
    },
    info: {
      wrapper: "bg-blue-50 border-blue-100",
      iconWrapper: "bg-white border-blue-100 shadow-sm",
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: "text-blue-900",
      titleText: "Missing Information",
      text: "text-blue-700",
      button: "bg-white border-blue-200 text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500 shadow-sm",
      link: "/dashboard/items"
    }
  }[alertType];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      {/* Subtle background grid for texture */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-6xl w-full space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {greeting}, {firstName ?? userName.split(" ")[0]}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {totalItems === 0
                ? "Your vault is empty. Add your first item to get started."
                : `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} securely stored.`}
            </p>
          </div>
          <Link
            href="/dashboard/items/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            aria-label="Add new item"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add New Item
          </Link>
        </header>

        {/* Alert Banner */}
        {hasAlerts && (
          <div className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border p-4 animate-in slide-in-from-bottom-2 fade-in duration-500",
            alertStyles.wrapper
          )}>
             <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", alertStyles.iconWrapper)}>
                {alertStyles.icon}
             </div>
             <div className="flex-1">
               <p className={cn("text-sm font-semibold", alertStyles.title)}>
                 {alertStyles.titleText}
               </p>
               <p className={cn("mt-0.5 text-sm", alertStyles.text)}>{focusMessage}</p>
             </div>
             <Link
               href={alertStyles.link}
               className={cn(
                 "mt-3 sm:mt-0 flex shrink-0 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
                 alertStyles.button
               )}
             >
               Review Now
             </Link>
          </div>
        )}

        {/* 12-column Bento Grid */}
        <div className="grid grid-cols-12 gap-5 lg:gap-6">
          {/* Row 1: 6 stat cards */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
            <StatCard
              label="Total Items"
              value={totalItems}
              icon={Layers}
              accentColor="slate"
              activitySummary="Documents & subscriptions"
              href="/dashboard/items"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
            <StatCard
              label="Expiring Soon"
              value={expiringSoon}
              icon={AlertTriangle}
              accentColor="amber"
              activitySummary="Within 30 days"
              href="/dashboard/items?status=expiring"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
            <StatCard
              label="This Week"
              value={thisWeek}
              icon={CalendarClock}
              accentColor="blue"
              activitySummary="Next 7 days"
              href="/dashboard/items?filter=timeline"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
            <StatCard
              label="Expired"
              value={expired}
              icon={XCircle}
              accentColor="red"
              isAlert={expired > 0}
              activitySummary="Need attention"
              href="/dashboard/items?status=expired"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
            <StatCard
              label="Documents"
              value={documents}
              icon={FileText}
              accentColor="indigo"
              activitySummary="Stored documents"
              href="/dashboard/items?class=document"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
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

          {/* Row 3: Category Distribution + Calendar + Upcoming Timeline */}
          <div className="col-span-12 lg:col-span-4">
            <CategoryDistributionPanel items={items} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <CalendarWidget items={items} today={now} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <UpcomingTimelinePanel items={upcomingItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
