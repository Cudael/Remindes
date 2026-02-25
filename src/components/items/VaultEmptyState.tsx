"use client";

import Link from "next/link";
import { Package, X, Plus } from "lucide-react";

interface VaultEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function VaultEmptyState({ hasActiveFilters, onClearFilters }: VaultEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-teal-500/10 blur-2xl rounded-full" />
          <Package className="h-10 w-10 text-slate-500 relative z-10" />
        </div>
        <h3 className="mb-3 text-xl font-bold text-white tracking-tight">No items found</h3>
        <p className="mb-8 max-w-sm text-sm text-slate-400 leading-relaxed">
          No items match your current filters. Try adjusting your search or clearing the filters to see your vault.
        </p>
        <button
          onClick={onClearFilters}
          className="group flex items-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/20 px-6 py-3 text-sm font-semibold text-teal-300 hover:bg-teal-500/20 hover:text-teal-200 transition-all hover:shadow-lg hover:shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-teal-500/10 blur-2xl rounded-full" />
        <Package className="h-10 w-10 text-slate-500 relative z-10" />
      </div>
      <h3 className="mb-3 text-2xl font-extrabold text-white tracking-tight">Your vault is empty</h3>
      <p className="mb-8 max-w-md text-base text-slate-400 leading-relaxed">
        Start organizing your life by adding your first document or subscription.
        Track expirations, renewals, and never miss an important date again.
      </p>
      <Link
        href="/dashboard/items/new"
        className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-slate-100 px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-white/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Add First Item
      </Link>
    </div>
  );
}
