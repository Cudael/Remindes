"use client";

import Link from "next/link";
import { Package, X } from "lucide-react";

interface VaultEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function VaultEmptyState({ hasActiveFilters, onClearFilters }: VaultEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/5">
          <Package className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white tracking-tight">No items found</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-slate-400">
          No items match your current filters. Try adjusting your search or clearing the filters.
        </p>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/20 px-5 py-2.5 text-sm font-medium text-teal-300 hover:bg-teal-500/20 transition-colors"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/5">
        <Package className="h-10 w-10 text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white tracking-tight">Your vault is empty</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-slate-400">
        Start organizing your life by adding your first document or subscription.
        Track expirations, renewals, and never miss an important date again.
      </p>
      <Link
        href="/dashboard/items/new"
        className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-400 transition-colors"
      >
        Add First Item
      </Link>
    </div>
  );
}
