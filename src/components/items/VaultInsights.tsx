"use client";

import { BarChart3, ChevronUp, ChevronDown } from "lucide-react";

interface InsightsData {
  needsAttention: number;
  expiringThisMonth: number;
}

interface VaultInsightsProps {
  showInsights: boolean;
  onToggle: () => void;
  insights: InsightsData;
  documentsCount: number;
  subscriptionsCount: number;
  onFilter: (key: string) => void;
}

interface MetricCardProps {
  label: string;
  value: number;
  colorClasses: string;
  filterKey: string;
  onFilter: (key: string) => void;
}

function MetricCard({ label, value, colorClasses, filterKey, onFilter }: MetricCardProps) {
  return (
    <button
      onClick={() => onFilter(filterKey)}
      className={`flex flex-col items-start gap-1 rounded-[1.25rem] border p-4 text-left transition-all duration-150 hover:brightness-110 ${colorClasses}`}
    >
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
    </button>
  );
}

export function VaultInsights({
  showInsights,
  onToggle,
  insights,
  documentsCount,
  subscriptionsCount,
  onFilter,
}: VaultInsightsProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors duration-150"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
            <BarChart3 className="h-4 w-4 text-teal-400" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Vault Insights</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{showInsights ? "Hide" : "View"}</span>
          {showInsights ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: showInsights ? "200px" : "0px" }}
      >
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-4">
          <MetricCard
            label="Needs Attention"
            value={insights.needsAttention}
            colorClasses="bg-rose-500/10 border-rose-500/20 text-rose-300"
            filterKey="expired"
            onFilter={onFilter}
          />
          <MetricCard
            label="Expiring Soon"
            value={insights.expiringThisMonth}
            colorClasses="bg-orange-500/10 border-orange-500/20 text-orange-300"
            filterKey="soon"
            onFilter={onFilter}
          />
          <MetricCard
            label="Documents"
            value={documentsCount}
            colorClasses="bg-teal-500/10 border-teal-500/20 text-teal-300"
            filterKey="documents"
            onFilter={onFilter}
          />
          <MetricCard
            label="Subscriptions"
            value={subscriptionsCount}
            colorClasses="bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
            filterKey="subscriptions"
            onFilter={onFilter}
          />
        </div>
      </div>
    </div>
  );
}
