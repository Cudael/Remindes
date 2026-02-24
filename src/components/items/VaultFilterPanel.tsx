"use client";

import { X } from "lucide-react";

export type StatFilterValue =
  | "all"
  | "soon"
  | "week"
  | "expired"
  | "documents"
  | "subscriptions"
  | "missingDocs";

export interface CategoryFilter {
  label: string;
  value: string;
  count: number;
}

interface VaultFilterPanelProps {
  activeCategory: string;
  activeStatFilter: StatFilterValue;
  categoryFilters: CategoryFilter[];
  hasActiveFilters: boolean;
  onCategoryChange: (value: string) => void;
  onStatFilterChange: (value: StatFilterValue) => void;
  onClearFilters: () => void;
}

const STATUS_FILTERS = [
  { label: "All Items", value: "all" },
  { label: "Expiring Soon", value: "soon" },
  { label: "This Week", value: "week" },
  { label: "Expired", value: "expired" },
  { label: "Documents", value: "documents" },
  { label: "Subscriptions", value: "subscriptions" },
  { label: "Missing Docs", value: "missingDocs" },
] as const satisfies { label: string; value: StatFilterValue }[];

export function VaultFilterPanel({
  activeCategory,
  activeStatFilter,
  categoryFilters,
  hasActiveFilters,
  onCategoryChange,
  onStatFilterChange,
  onClearFilters,
}: VaultFilterPanelProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Status filters */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Status</p>
        {STATUS_FILTERS.map((f) => {
          const isActive = activeStatFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => onStatFilterChange(f.value)}
              className={`w-full rounded-xl px-3 py-2 text-sm text-left transition-all duration-150 ${
                isActive
                  ? "bg-teal-500/15 border border-teal-500/30 text-teal-300 shadow-sm shadow-teal-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Category filters */}
      {categoryFilters.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Category</p>
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full rounded-xl px-3 py-2 text-sm text-left flex items-center justify-between transition-all duration-150 ${
              activeCategory === ""
                ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-sm shadow-indigo-500/10"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categoryFilters.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm text-left flex items-center justify-between transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-sm shadow-indigo-500/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-indigo-500/30 text-indigo-200" : "bg-white/10 text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
