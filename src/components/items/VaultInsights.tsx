"use client";

import { BarChart3, ChevronUp, ChevronDown, AlertTriangle, Clock, FileText, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  icon: LucideIcon;
  filterKey: string;
  onFilter: (key: string) => void;
}

function MetricCard({ label, value, colorClasses, icon: Icon, filterKey, onFilter }: MetricCardProps) {
  return (
    <button
      onClick={() => onFilter(filterKey)}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-[1.5rem] border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2",
        colorClasses
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-3xl font-extrabold tracking-tight">{value}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">{label}</span>
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
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
            <BarChart3 className="h-4 w-4 text-teal-400" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Vault Insights</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{showInsights ? "Hide" : "View"}</span>
          {showInsights ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: showInsights ? "600px" : "0px", opacity: showInsights ? 1 : 0 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-5 pb-5 pt-2">
          <MetricCard
            label="Needs Attention"
            value={insights.needsAttention}
            colorClasses="bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-300 hover:border-rose-500/40 hover:shadow-rose-500/10 focus-visible:ring-rose-500"
            icon={AlertTriangle}
            filterKey="expired"
            onFilter={onFilter}
          />
          <MetricCard
            label="Expiring Soon"
            value={insights.expiringThisMonth}
            colorClasses="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-300 hover:border-orange-500/40 hover:shadow-orange-500/10 focus-visible:ring-orange-500"
            icon={Clock}
            filterKey="soon"
            onFilter={onFilter}
          />
          <MetricCard
            label="Documents"
            value={documentsCount}
            colorClasses="bg-gradient-to-br from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-300 hover:border-teal-500/40 hover:shadow-teal-500/10 focus-visible:ring-teal-500"
            icon={FileText}
            filterKey="documents"
            onFilter={onFilter}
          />
          <MetricCard
            label="Subscriptions"
            value={subscriptionsCount}
            colorClasses="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/40 hover:shadow-indigo-500/10 focus-visible:ring-indigo-500"
            icon={RefreshCw}
            filterKey="subscriptions"
            onFilter={onFilter}
          />
        </div>
      </div>
    </div>
  );
}
