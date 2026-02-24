import Link from "next/link";
import { History, Package, ArrowUpRight, FileText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentItem {
  id: string;
  name: string;
  category: string | null;
  itemClass: string | null;
  createdAt: Date;
}

interface RecentlyAddedPanelProps {
  items: RecentItem[];
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const categoryColors: Record<string, string> = {
  Travel: "bg-blue-500/10 text-blue-400",
  Identification: "bg-purple-500/10 text-purple-400",
  Financial: "bg-emerald-500/10 text-emerald-400",
  Insurance: "bg-orange-500/10 text-orange-400",
  Subscriptions: "bg-teal-500/10 text-teal-400",
  Legal: "bg-rose-500/10 text-rose-400",
  Other: "bg-slate-500/10 text-slate-400",
};

export function RecentlyAddedPanel({ items }: RecentlyAddedPanelProps) {
  const recent = items.slice(0, 4);

  return (
    <div className="h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-500/10 border border-slate-500/20">
            <History className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-white">Recently Added</h3>
        </div>
        <Link
          href="/dashboard/items"
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          aria-label="View all items"
        >
          View All →
        </Link>
      </div>

      {/* Content */}
      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-white/5">
            <Package className="h-6 w-6 text-slate-500" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-500">No items yet</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-1">
          {recent.map((item) => {
            const cat = item.category ?? "Other";
            const badgeClass = categoryColors[cat] ?? categoryColors["Other"];
            const Icon = item.itemClass === "subscription" ? RefreshCw : FileText;

            return (
              <li key={item.id}>
                <Link
                  href={`/dashboard/items/${item.id}`}
                  className="group grid grid-cols-[2rem_1fr_1.25rem] items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-label={`View ${item.name}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 border border-white/5 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          badgeClass
                        )}
                      >
                        {cat}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
