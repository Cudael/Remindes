import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentColor = "slate" | "blue" | "red" | "teal" | "orange" | "amber" | "rose" | "emerald" | "indigo";

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
  slate: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-600",
    ring: "ring-slate-400/20",
    pulse: "bg-slate-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
    ring: "ring-blue-400/20",
    pulse: "bg-blue-500",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-600",
    ring: "ring-red-400/20",
    pulse: "bg-red-500",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-100",
    text: "text-teal-600",
    ring: "ring-teal-400/20",
    pulse: "bg-teal-500",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-100",
    text: "text-orange-600",
    ring: "ring-orange-400/20",
    pulse: "bg-orange-500",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-600",
    ring: "ring-amber-400/20",
    pulse: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    ring: "ring-rose-400/20",
    pulse: "bg-rose-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-600",
    ring: "ring-emerald-400/20",
    pulse: "bg-emerald-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-600",
    ring: "ring-indigo-400/20",
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

  const cardContent = (
    <div
      className={cn(
        "relative flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200",
        href && "group-hover:border-slate-300 group-hover:shadow-md group-hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            colors.bg,
            colors.border,
            isAlert && `ring-2 ring-offset-2 ring-offset-white ${colors.ring}`
          )}
        >
          <Icon className={cn("h-5 w-5", colors.text)} aria-hidden="true" />
        </div>
        {isAlert && (
          <span className="relative flex h-2.5 w-2.5 mt-1 mr-1">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", colors.pulse)} />
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", colors.pulse)} />
          </span>
        )}
      </div>
      <div className="mt-auto pt-2">
        <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
        {activitySummary && (
          <p className="mt-1 text-xs text-slate-400 line-clamp-1">{activitySummary}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl" 
        aria-label={`${label}: ${value}`}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full">{cardContent}</div>;
}
