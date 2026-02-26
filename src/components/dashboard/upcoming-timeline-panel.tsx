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

type ItemColor = "red" | "amber" | "blue";

function getItemColor(daysLeft: number | null): ItemColor {
  if (daysLeft === null || daysLeft > 30) return "blue";
  if (daysLeft <= 7) return "red";
  return "amber";
}

const dotStyles: Record<ItemColor, string> = {
  red: "border-red-200 bg-red-100",
  amber: "border-amber-200 bg-amber-100",
  blue: "border-blue-200 bg-blue-100",
};

const badgeStyles: Record<ItemColor, string> = {
  red: "bg-red-50 border-red-100 text-red-700",
  amber: "bg-amber-50 border-amber-100 text-amber-700",
  blue: "bg-blue-50 border-blue-100 text-blue-700",
};

const textStyles: Record<ItemColor, string> = {
  red: "text-red-600",
  amber: "text-amber-600",
  blue: "text-blue-600",
}

export function UpcomingTimelinePanel({ items }: UpcomingTimelinePanelProps) {
  return (
    <div className="h-full rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
          <GitCommit className="h-4 w-4 text-slate-600" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h3>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
            <Calendar className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-500 font-medium">No upcoming deadlines.</p>
        </div>
      ) : (
        <div className="relative flex-1">
          {/* Vertical timeline line */}
          <div
            className="absolute bottom-0 left-[11px] top-2 w-px bg-slate-200"
            aria-hidden="true"
          />

          <ul className="space-y-5 relative">
            {items.map((item, i) => {
              const targetDate = item.expirationDate ?? item.renewalDate;
              const daysLeft = getDaysLeft(targetDate);
              const color = getItemColor(daysLeft);

              return (
                <li key={item.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="relative mt-1 flex shrink-0 items-center justify-center">
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center z-10",
                        dotStyles[color]
                      )}
                    >
                        <span className={cn("w-2 h-2 rounded-full", color === "red" ? "bg-red-500" : color === "amber" ? "bg-amber-500" : "bg-blue-500")} />
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/items/${item.id}`}
                    className="group block flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-white hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </p>
                        {targetDate && (
                          <p className="mt-0.5 text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatExpiryDate(targetDate)}
                          </p>
                        )}
                      </div>
                      <div
                        className={cn(
                          "inline-flex w-fit items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                          badgeStyles[color]
                        )}
                      >
                        {daysLeft !== null ? getDayLabel(daysLeft) : "Unknown"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
