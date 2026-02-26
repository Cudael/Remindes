import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryDistributionPanelProps {
  items: Array<{ category: string | null; itemClass: string | null }>;
}

const CATEGORIES: Array<{ key: string; label: string; emoji: string }> = [
  { key: "Travel", label: "Travel", emoji: "✈️" },
  { key: "Identification", label: "Identification", emoji: "🪪" },
  { key: "Financial", label: "Financial", emoji: "💳" },
  { key: "Insurance", label: "Insurance", emoji: "🛡️" },
  { key: "Subscriptions", label: "Subscriptions", emoji: "🔄" },
  { key: "Legal", label: "Legal", emoji: "⚖️" },
  { key: "Other", label: "Other", emoji: "📄" },
];

export function CategoryDistributionPanel({ items }: CategoryDistributionPanelProps) {
  // Count items per category
  const counts = new Map<string, number>();
  for (const item of items) {
    const cat = item.category ?? "Other";
    const key = CATEGORIES.find((c) => c.key === cat)?.key ?? "Other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const maxCount = Math.max(...Array.from(counts.values()), 1);

  const rows = CATEGORIES.map((cat) => ({
    ...cat,
    count: counts.get(cat.key) ?? 0,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return (
    <div className="h-full rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <LayoutGrid className="h-4 w-4 text-blue-600" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Vault Distribution</h3>
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">No items to display</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-4">
          {rows.map((cat) => {
            const pct = (cat.count / maxCount) * 100;
            return (
              <li key={cat.key}>
                <Link
                  href={`/dashboard/items?category=${encodeURIComponent(cat.key)}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg"
                  aria-label={`View ${cat.label} items: ${cat.count}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{cat.count}</span>
                  </div>
                  {/* Progress bar track */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    {/* Progress bar fill */}
                    <div
                      className={cn(
                        "h-full rounded-full bg-blue-500 transition-all duration-500 ease-in-out",
                        "group-hover:bg-blue-600"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
