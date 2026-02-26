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
  error: "bg-red-500",
  "warning-high": "bg-amber-500",
  "warning-medium": "bg-yellow-500",
  info: "bg-blue-500",
};

const textColors: Record<Severity, string> = {
  error: "text-red-700",
  "warning-high": "text-amber-700",
  "warning-medium": "text-yellow-700",
  info: "text-blue-700",
};

const ctaColors: Record<Severity, string> = {
  error: "text-red-600 hover:text-red-800",
  "warning-high": "text-amber-600 hover:text-amber-800",
  "warning-medium": "text-yellow-600 hover:text-yellow-800",
  info: "text-blue-600 hover:text-blue-800",
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
      ctaLabel: "Add item &rarr;",
    });
    return actions;
  }

  if (expired > 0) {
    actions.push({
      severity: "error",
      text: `${expired} item${expired !== 1 ? "s have" : " has"} expired and need attention.`,
      href: "/dashboard/items?status=expired",
      ctaLabel: "View expired &rarr;",
    });
  }

  if (expiringSoon > 0) {
    actions.push({
      severity: "warning-high",
      text: `${expiringSoon} item${expiringSoon !== 1 ? "s are" : " is"} expiring within 30 days.`,
      href: "/dashboard/items?status=expiring",
      ctaLabel: "View expiring &rarr;",
    });
  }

  if (missingAttachments > 0) {
    actions.push({
      severity: "warning-medium",
      text: `${missingAttachments} item${missingAttachments !== 1 ? "s are" : " is"} missing attachments.`,
      href: "/dashboard/items",
      ctaLabel: "View items &rarr;",
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
    <div className="relative h-full rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      {/* Subtle indicator line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1", 
          allClear ? "bg-emerald-400" : "bg-red-400"
        )}
        aria-hidden="true"
      />

      <div className="p-6 flex flex-col flex-1 pt-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
            <Zap className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Action Required</h3>
        </div>

        {/* Content */}
        {allClear ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-500 text-center font-medium">
              All clear. No pending actions.
            </p>
          </div>
        ) : (
          <ul className="flex-1 space-y-4">
            {actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0 shadow-sm",
                    dotColors[action.severity]
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {action.text}
                  </p>
                  <Link
                    href={action.href}
                    className={cn(
                      "mt-1 inline-block text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded",
                      ctaColors[action.severity]
                    )}
                    aria-label={action.ctaLabel.replace('&rarr;', '→')}
                  >
                    <span dangerouslySetInnerHTML={{ __html: action.ctaLabel }} />
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
