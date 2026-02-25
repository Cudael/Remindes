import Link from "next/link";
import { LayoutGrid } from "lucide-react";

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

  const totalCount = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <LayoutGrid className="h-4 w-4 text-indigo-400" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-white">Vault Distribution</h3>
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">No items to display</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-3">
          {rows.map((cat) => {
            const pct = (cat.count / maxCount) * 100;
            return (
              <li key={cat.key}>
                <Link
                  href={`/dashboard/items?category=${encodeURIComponent(cat.key)}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
                  aria-label={`View ${cat.label} items: ${cat.count}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-sm text-slate-300 group-hover:text-white transition-colors">
                      <span aria-hidden="true">{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {cat.count} ({Math.round((cat.count / totalCount) * 100)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={cat.count}
                      aria-valuemax={maxCount}
                      aria-label={`${cat.label} ${cat.count} of ${maxCount}`}
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
