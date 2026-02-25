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

  return (
    <>
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

      {/* Centered Main Content Container - Restricted Width */}
      <div className="relative z-10 mx-auto max-w-6xl w-full space-y-8 pb-12 px-4 sm:px-6 lg:px-8 mt-6">
        {/* Greeting & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                {firstName ?? userName.split(" ")[0]}.
              </span>
            </h1>
            <p className="text-base text-slate-400 font-medium">
              {totalItems === 0
                ? "Your vault is empty. Add your first item to get started."
                : `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} securely stored.`}
            </p>
          </div>
          <Link
            href="/dashboard/items/new"
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-slate-100 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-white/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="Add new item"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden="true" />
            Add New Item
          </Link>
        </div>

        {/* Alert Banner */}
        {totalItems > 0 && (expired > 0 || expiringSoon > 0 || missingAttachments > 0) && (
          <div className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border p-5 backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-500 shadow-xl",
            expired > 0 
              ? "border-rose-500/30 bg-rose-500/10 text-rose-200 shadow-rose-500/5" 
              : expiringSoon > 0 
                ? "border-amber-500/30 bg-amber-500/10 text-amber-200 shadow-amber-500/5"
                : "border-indigo-500/30 bg-indigo-500/10 text-indigo-200 shadow-indigo-500/5"
          )}>
             <div className={cn(
               "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
               expired > 0 ? "border-rose-500/30 bg-rose-500/20" : expiringSoon > 0 ? "border-amber-500/30 bg-amber-500/20" : "border-indigo-500/30 bg-indigo-500/20"
             )}>
                {expired > 0 || expiringSoon > 0 ? (
                  <AlertTriangle className={cn("h-6 w-6", expired > 0 ? "text-rose-400" : "text-amber-400")} />
                ) : (
                  <Info className="h-6 w-6 text-indigo-400" />
                )}
             </div>
             <div className="flex-1">
               <p className="text-lg font-semibold text-white">
                 {expired > 0 ? "Attention Required" : expiringSoon > 0 ? "Upcoming Expirations" : "Missing Information"}
               </p>
               <p className="mt-1 text-sm font-medium opacity-90">{focusMessage}</p>
             </div>
             <Link
               href={expired > 0 ? "/dashboard/items?status=expired" : expiringSoon > 0 ? "/dashboard/items?status=expiring" : "/dashboard/items"}
               className={cn(
                 "mt-3 sm:mt-0 flex shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                 expired > 0 ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 focus-visible:ring-rose-500" : expiringSoon > 0 ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 focus-visible:ring-amber-500" : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 focus-visible:ring-indigo-500"
               )}
             >
               Review Now
             </Link>
          </div>
        )}

        {/* 12-column bento grid */}
        <div className="grid grid-cols-12 gap-5 lg:gap-6">
          {/* Row 1: 6 stat cards */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
            <StatCard
              label="Total Items"
              value={totalItems}
              icon={Layers}
              accentColor="teal"
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
              accentColor="orange"
              activitySummary="Next 7 days"
              href="/dashboard/items?filter=timeline"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2">
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
