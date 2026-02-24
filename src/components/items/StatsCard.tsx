import { type ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down";
  trendValue?: string;
  colorClass?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  colorClass = "text-foreground",
}: StatsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2">
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
