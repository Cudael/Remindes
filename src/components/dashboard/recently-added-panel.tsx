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
  Travel: "bg-blue-50 text-blue-700",
  Identification: "bg-purple-50 text-purple-700",
  Financial: "bg-emerald-50 text-emerald-700",
  Insurance: "bg-orange-50 text-orange-700",
  Subscriptions: "bg-teal-50 text-teal-700",
  Legal: "bg-rose-50 text-rose-700",
  Other: "bg-slate-100 text-slate-700",
};

export function RecentlyAddedPanel({ items }: RecentlyAddedPanelProps) {
  const recent = items.slice(0, 4);

  return (
    <div className="h-full rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <History className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Recently Added</h3>
        </div>
        <Link
          href="/dashboard/items"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
          aria-label="View all items"
        >
          View All &rarr;
        </Link>
      </div>

      {/* Content */}
      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
            <Package className="h-5 w-5 text-slate-400" aria-hidden="true" />
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
                  className="group grid grid-cols-[2.5rem_1fr_1.25rem] items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  aria-label={`View ${item.name}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold",
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
                    className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
