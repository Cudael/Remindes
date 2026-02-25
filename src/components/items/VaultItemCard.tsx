"use client";

import { useRouter } from "next/navigation";
import { Trash2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { getItemStatus } from "@/lib/item-utils";
import { cn } from "@/lib/utils";

interface ItemType {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
}

interface VaultItem {
  id: string;
  name: string;
  category?: string | null;
  itemClass?: string | null;
  itemType?: ItemType | null;
  expirationDate?: string | null;
  renewalDate?: string | null;
  price?: number | null;
  billingCycle?: string | null;
  createdAt: string;
}

interface VaultItemCardProps {
  item: VaultItem;
  onDelete: (item: VaultItem) => void;
}

function expirationStatus(daysLeft: number | null, status: string) {
  if (status === "expired") {
    return {
      label: "Expired",
      bgClass: "bg-rose-500/10",
      textClass: "text-rose-400",
      borderClass: "border-rose-500/20",
      barClass: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
      icon: AlertCircle,
    };
  }
  if (status === "expiring") {
    if (daysLeft !== null && daysLeft <= 7) {
      return {
        label: "Soon",
        bgClass: "bg-orange-500/10",
        textClass: "text-orange-400",
        borderClass: "border-orange-500/20",
        barClass: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
        icon: Clock,
      };
    }
    return {
      label: "Expiring",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-400",
      borderClass: "border-amber-500/20",
      barClass: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
      icon: Clock,
    };
  }
  return {
    label: "Active",
    bgClass: "bg-teal-500/10",
    textClass: "text-teal-400",
    borderClass: "border-teal-500/20",
    barClass: "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]",
    icon: CheckCircle2,
  };
}

function progressPercent(daysLeft: number | null, status: string): number {
  if (status === "expired") return 100;
  if (daysLeft === null) return 0;
  // 0–365 scale, clamped
  const pct = Math.min(Math.max(((365 - daysLeft) / 365) * 100, 0), 100);
  return pct;
}

export function VaultItemCard({ item, onDelete }: VaultItemCardProps) {
  const router = useRouter();
  const { status, daysLeft } = getItemStatus(item);
  const category = item.category ?? item.itemType?.category ?? "Other";
  const icon = item.itemType?.icon ?? null;
  const isSubscription = item.itemClass === "subscription";
  const expStatus = expirationStatus(daysLeft, status);
  const progress = progressPercent(daysLeft, status);

  const StatusIcon = expStatus.icon;

  function daysLabel() {
    if (daysLeft === null) return null;
    if (status === "expired") return `${Math.abs(daysLeft)}d overdue`;
    if (daysLeft === 0) return "Today";
    return `${daysLeft}d left`;
  }

  return (
    <div
      className="group relative rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl overflow-hidden cursor-pointer
        transition-all duration-300 hover:bg-slate-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/10 hover:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
      onClick={() => router.push(`/dashboard/items/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/dashboard/items/${item.id}`)}
      aria-label={`View ${item.name}`}
    >
      {/* Top gradient glow line on hover */}
      <div className={cn("absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100", expStatus.textClass)} />

      {/* Delete button */}
      <button
        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 backdrop-blur-md transition-all duration-300 hover:bg-rose-500 hover:text-white opacity-100 md:opacity-0 md:translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Header / Icon Area */}
      <div className="relative px-5 pt-6 pb-2 flex items-start justify-between">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl border bg-slate-950/50 text-3xl shadow-inner", expStatus.borderClass)}>
          <span className="select-none">{icon ?? (isSubscription ? "🔄" : "📄")}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 pb-6 pt-3 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", expStatus.bgClass, expStatus.borderClass, expStatus.textClass)}>
              <StatusIcon className="h-3 w-3" />
              {expStatus.label}
            </span>
            <span className="inline-flex rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {isSubscription ? "Subscription" : "Document"}
            </span>
          </div>
          <h3 className="font-bold text-lg text-white truncate tracking-tight">{item.name}</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wider">{category}</p>
        </div>

        {/* Progress bar + days label */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className={cn("text-[10px] uppercase tracking-widest font-bold", expStatus.textClass)}>
              {daysLabel() ?? "No expiry"}
            </span>
            <span className="text-[10px] font-bold text-slate-500">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/50 overflow-hidden shadow-inner">
            <div
              className={cn("h-full rounded-full transition-all duration-1000 ease-out", expStatus.barClass)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
