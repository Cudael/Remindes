import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "expiring" | "expired";
  daysLeft?: number;
  className?: string;
}

export function StatusBadge({ status, daysLeft, className }: StatusBadgeProps) {
  const variants = {
    active: {
      bg: "bg-green-500/10",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-500/20",
      label: "Active",
    },
    expiring: {
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/20",
      label: daysLeft !== undefined ? `${daysLeft}d left` : "Expiring Soon",
    },
    expired: {
      bg: "bg-red-500/10",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-500/20",
      label: "Expired",
    },
  };

  const variant = variants[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant.bg,
        variant.text,
        variant.border,
        className
      )}
    >
      {variant.label}
    </span>
  );
}
