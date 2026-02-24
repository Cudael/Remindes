interface StatusIndicatorProps {
  status: "active" | "expiring" | "expired";
  daysLeft?: number | null;
  className?: string;
}

export function StatusIndicator({ status, daysLeft, className = "" }: StatusIndicatorProps) {
  const config = {
    active: {
      label: "Active",
      dot: "bg-green-500",
      text: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    expiring: {
      label: "Expiring Soon",
      dot: "bg-yellow-500",
      text: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    expired: {
      label: "Expired",
      dot: "bg-red-500",
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  }[status];

  const daysLabel =
    daysLeft != null
      ? daysLeft < 0
        ? `${Math.abs(daysLeft)}d ago`
        : daysLeft === 0
          ? "Today"
          : `${daysLeft}d left`
      : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {daysLabel && <span className="opacity-75">· {daysLabel}</span>}
    </span>
  );
}
