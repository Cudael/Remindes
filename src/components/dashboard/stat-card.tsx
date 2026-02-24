import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentColor = "teal" | "orange" | "amber" | "rose" | "emerald" | "indigo";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentColor: AccentColor;
  isAlert?: boolean;
  activitySummary?: string;
  href?: string;
}

const colorMap: Record<
  AccentColor,
  { bg: string; border: string; text: string; ring: string; pulse: string }
> = {
  teal: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    text: "text-teal-400",
    ring: "ring-teal-400/40",
    pulse: "bg-teal-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
    ring: "ring-orange-400/40",
    pulse: "bg-orange-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    ring: "ring-amber-400/40",
    pulse: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
    ring: "ring-rose-400/40",
    pulse: "bg-rose-500",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    ring: "ring-emerald-400/40",
    pulse: "bg-emerald-500",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    ring: "ring-indigo-400/40",
    pulse: "bg-indigo-500",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  isAlert,
  activitySummary,
  href,
}: StatCardProps) {
  const colors = colorMap[accentColor];

  const card = (
    <div
      className={cn(
        "rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 flex flex-col gap-4",
        href && "hover:bg-slate-900/80 transition-colors cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            colors.bg,
            colors.border,
            isAlert && `ring-1 ${colors.ring}`
          )}
        >
          <Icon className={cn("h-5 w-5", colors.text)} aria-hidden="true" />
        </div>
        {isAlert && (
          <span
            className={cn("h-2.5 w-2.5 rounded-full animate-pulse", colors.pulse)}
            aria-hidden="true"
          />
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-400">{label}</p>
        {activitySummary && (
          <p className="mt-1 text-xs text-slate-500">{activitySummary}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-3xl" aria-label={`${label}: ${value}`}>
        {card}
      </Link>
    );
  }

  return card;
}
