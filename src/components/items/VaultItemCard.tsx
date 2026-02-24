"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getItemStatus } from "@/lib/item-utils";

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
      ribbonClass: "bg-rose-500",
      barClass: "bg-rose-500",
    };
  }
  if (status === "expiring") {
    if (daysLeft !== null && daysLeft <= 7) {
      return {
        label: "Soon",
        ribbonClass: "bg-orange-500",
        barClass: "bg-orange-500",
      };
    }
    return {
      label: "Expiring",
      ribbonClass: "bg-amber-500",
      barClass: "bg-amber-500",
    };
  }
  return {
    label: "Active",
    ribbonClass: "bg-teal-500",
    barClass: "bg-teal-500",
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

  function daysLabel() {
    if (daysLeft === null) return null;
    if (status === "expired") return `${Math.abs(daysLeft)}d overdue`;
    if (daysLeft === 0) return "Today";
    return `${daysLeft}d left`;
  }

  return (
    <div
      className="group relative rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden cursor-pointer
        transition-all duration-200 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:border-teal-500/30"
      onClick={() => router.push(`/dashboard/items/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/dashboard/items/${item.id}`)}
      aria-label={`View ${item.name}`}
    >
      {/* Top-edge glow line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Image / icon area */}
      <div className="relative h-28 bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

        {/* Icon */}
        <span className="relative text-4xl select-none">
          {icon ?? (isSubscription ? "🔄" : "📄")}
        </span>

        {/* Status ribbon */}
        <div
          className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white ${expStatus.ribbonClass}`}
        >
          {expStatus.label}
        </div>

        {/* Type badge */}
        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          {isSubscription ? "Subscription" : "Document"}
        </div>

        {/* Delete button (hover reveal) */}
        <button
          className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-400
            opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-rose-900/80 hover:text-rose-300"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-3 space-y-2.5">
        {/* Title */}
        <h3 className="font-semibold text-sm text-white truncate tracking-tight">{item.name}</h3>

        {/* Category badge */}
        <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
          {category}
        </span>

        {/* Progress bar + days label */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {daysLabel() ?? "No expiry"}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${expStatus.barClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
