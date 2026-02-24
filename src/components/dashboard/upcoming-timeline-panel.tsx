import Link from "next/link";
import { GitCommit, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  name: string;
  expirationDate: Date | null;
  renewalDate: Date | null;
}

interface UpcomingTimelinePanelProps {
  items: TimelineItem[];
}

function getDaysLeft(date: Date | null): number | null {
  if (!date) return null;
  const now = new Date();
  return Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatExpiryDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getDayLabel(daysLeft: number): string {
  if (daysLeft < 0) return "Expired";
  if (daysLeft === 0) return "Expires today";
  return `In ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
}

type ItemColor = "rose" | "orange" | "teal";

function getItemColor(daysLeft: number | null): ItemColor {
  if (daysLeft === null || daysLeft > 30) return "teal";
  if (daysLeft <= 7) return "rose";
  return "orange";
}

const dotStyles: Record<ItemColor, string> = {
  rose: "border-rose-400 bg-rose-900/50 shadow-[0_0_10px_rgba(251,113,133,0.5)]",
  orange: "border-orange-400 bg-orange-900/50 shadow-[0_0_10px_rgba(251,146,60,0.5)]",
  teal: "border-teal-400 bg-teal-900/50 shadow-[0_0_10px_rgba(45,212,191,0.5)]",
};

const labelStyles: Record<ItemColor, string> = {
  rose: "text-rose-400",
  orange: "text-orange-400",
  teal: "text-teal-400",
};

const badgeStyles: Record<ItemColor, string> = {
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
};

export function UpcomingTimelinePanel({ items }: UpcomingTimelinePanelProps) {
  return (
    <div className="h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
          <GitCommit className="h-4 w-4 text-teal-400" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-white">Upcoming Timeline</h3>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-white/5">
            <Calendar className="h-6 w-6 text-slate-500" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-500">No upcoming expirations</p>
        </div>
      ) : (
        <div className="relative flex-1">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-teal-400 via-cyan-500 to-transparent opacity-30"
            aria-hidden="true"
          />

          <ul className="relative space-y-5">
            {items.map((item) => {
              const date = item.expirationDate ?? item.renewalDate;
              const daysLeft = getDaysLeft(date);
              const color = getItemColor(daysLeft);

              return (
                <li key={item.id} className="flex items-start gap-4 pl-1">
                  {/* Dot */}
                  <div
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0 rounded-full border-2",
                      dotStyles[color]
                    )}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/items/${item.id}`}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                      aria-label={`View ${item.name}`}
                    >
                      <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {date && (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              badgeStyles[color]
                            )}
                          >
                            {formatExpiryDate(date)}
                          </span>
                        )}
                        {daysLeft !== null && (
                          <span className={cn("text-xs font-medium", labelStyles[color])}>
                            {getDayLabel(daysLeft)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
