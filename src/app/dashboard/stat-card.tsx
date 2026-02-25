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
  { bg: string; border: string; hoverBorder: string; text: string; ring: string; pulse: string; hoverShadow: string }
> = {
  teal: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    hoverBorder: "group-hover:border-teal-500/40",
    text: "text-teal-400",
    ring: "ring-teal-400/40",
    pulse: "bg-teal-500",
    hoverShadow: "group-hover:shadow-teal-500/10",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    hoverBorder: "group-hover:border-orange-500/40",
    text: "text-orange-400",
    ring: "ring-orange-400/40",
    pulse: "bg-orange-500",
    hoverShadow: "group-hover:shadow-orange-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hoverBorder: "group-hover:border-amber-500/40",
    text: "text-amber-400",
    ring: "ring-amber-400/40",
    pulse: "bg-amber-500",
    hoverShadow: "group-hover:shadow-amber-500/10",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    hoverBorder: "group-hover:border-rose-500/40",
    text: "text-rose-400",
    ring: "ring-rose-400/40",
    pulse: "bg-rose-500",
    hoverShadow: "group-hover:shadow-rose-500/10",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "group-hover:border-emerald-500/40",
    text: "text-emerald-400",
    ring: "ring-emerald-400/40",
    pulse: "bg-emerald-500",
    hoverShadow: "group-hover:shadow-emerald-500/10",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    hoverBorder: "group-hover:border-indigo-500/40",
    text: "text-indigo-400",
    ring: "ring-indigo-400/40",
    pulse: "bg-indigo-500",
    hoverShadow: "group-hover:shadow-indigo-500/10",
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
        "relative flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl transition-all duration-300",
        href && cn("group-hover:bg-slate-900/80 group-hover:shadow-xl group-hover:-translate-y-1", colors.hoverBorder, colors.hoverShadow)
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-300",
            colors.bg,
            colors.border,
            href && "group-hover:scale-110 group-hover:rotate-3",
            isAlert && `ring-2 ring-offset-2 ring-offset-slate-950 ${colors.ring}`
          )}
        >
          <Icon className={cn("h-6 w-6", colors.text)} aria-hidden="true" />
        </div>
        {isAlert && (
          <span className="relative flex h-3 w-3">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", colors.pulse)} />
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", colors.pulse)} />
          </span>
        )}
      </div>
      <div className="mt-auto pt-4">
        <p className="text-4xl font-extrabold tracking-tight text-white">{value}</p>
        <p className="mt-2 text-sm font-semibold text-slate-400">{label}</p>
        {activitySummary && (
          <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">{activitySummary}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-3xl" 
        aria-label={`${label}: ${value}`}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full">{cardContent}</div>;
}
