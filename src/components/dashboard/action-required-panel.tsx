import Link from "next/link";
import { Zap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionRequiredPanelProps {
  expired: number;
  expiringSoon: number;
  total: number;
  missingAttachments: number;
}

type Severity = "error" | "warning-high" | "warning-medium" | "info";

interface ActionItem {
  severity: Severity;
  text: string;
  href: string;
  ctaLabel: string;
}

const dotColors: Record<Severity, string> = {
  error: "bg-rose-500",
  "warning-high": "bg-orange-500",
  "warning-medium": "bg-amber-500",
  info: "bg-teal-500",
};

const textColors: Record<Severity, string> = {
  error: "text-rose-300",
  "warning-high": "text-orange-300",
  "warning-medium": "text-amber-300",
  info: "text-teal-300",
};

const ctaColors: Record<Severity, string> = {
  error: "text-rose-400 hover:text-rose-300",
  "warning-high": "text-orange-400 hover:text-orange-300",
  "warning-medium": "text-amber-400 hover:text-amber-300",
  info: "text-teal-400 hover:text-teal-300",
};

function buildActions(
  expired: number,
  expiringSoon: number,
  total: number,
  missingAttachments: number
): ActionItem[] {
  const actions: ActionItem[] = [];

  if (total === 0) {
    actions.push({
      severity: "info",
      text: "Your vault is empty. Add your first item.",
      href: "/dashboard/items/new",
      ctaLabel: "Add item →",
    });
    return actions;
  }

  if (expired > 0) {
    actions.push({
      severity: "error",
      text: `${expired} item${expired !== 1 ? "s have" : " has"} expired and need attention.`,
      href: "/dashboard/items?status=expired",
      ctaLabel: "View expired →",
    });
  }

  if (expiringSoon > 0) {
    actions.push({
      severity: "warning-high",
      text: `${expiringSoon} item${expiringSoon !== 1 ? "s are" : " is"} expiring within 30 days.`,
      href: "/dashboard/items?status=expiring",
      ctaLabel: "View expiring →",
    });
  }

  if (missingAttachments > 0) {
    actions.push({
      severity: "warning-medium",
      text: `${missingAttachments} item${missingAttachments !== 1 ? "s are" : " is"} missing attachments.`,
      href: "/dashboard/items",
      ctaLabel: "View items →",
    });
  }

  return actions;
}

export function ActionRequiredPanel({
  expired,
  expiringSoon,
  total,
  missingAttachments,
}: ActionRequiredPanelProps) {
  const actions = buildActions(expired, expiringSoon, total, missingAttachments);
  const allClear =
    expired === 0 && expiringSoon === 0 && missingAttachments === 0 && total > 0;

  return (
    <div className="relative h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 overflow-hidden flex flex-col">
      {/* Gradient top border */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500"
        aria-hidden="true"
      />

      <div className="p-6 flex flex-col flex-1 pt-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
            <Zap className="h-4 w-4 text-rose-400" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-white">Action Required</h3>
        </div>

        {/* Content */}
        {allClear ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-400 text-center">
              All clear. No pending actions.
            </p>
          </div>
        ) : (
          <ul className="flex-1 space-y-4">
            {actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0",
                    dotColors[action.severity]
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", textColors[action.severity])}>
                    {action.text}
                  </p>
                  <Link
                    href={action.href}
                    className={cn(
                      "mt-1 inline-block text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded",
                      ctaColors[action.severity]
                    )}
                    aria-label={action.ctaLabel}
                  >
                    {action.ctaLabel}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
