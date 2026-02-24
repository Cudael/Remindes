export interface ItemStatusResult {
  status: "active" | "expiring" | "expired";
  daysLeft: number | null;
  urgency: "low" | "medium" | "high";
}

export function getItemStatus(item: {
  expirationDate?: Date | string | null;
  renewalDate?: Date | string | null;
}): ItemStatusResult {
  const relevantDate = item.expirationDate ?? item.renewalDate;
  if (!relevantDate) return { status: "active", daysLeft: null, urgency: "low" };

  const now = new Date();
  const expiry = new Date(relevantDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "expired", daysLeft: diffDays, urgency: "high" };
  } else if (diffDays <= 30) {
    return {
      status: "expiring",
      daysLeft: diffDays,
      urgency: diffDays <= 7 ? "high" : "medium",
    };
  } else {
    return { status: "active", daysLeft: diffDays, urgency: "low" };
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Travel: "✈️",
    Identification: "🪪",
    Financial: "💳",
    Subscription: "🔄",
    Subscriptions: "🔄",
    Insurance: "🛡️",
    Legal: "⚖️",
    Education: "🎓",
    Health: "🏥",
    Other: "📄",
  };
  return icons[category] ?? "📄";
}

export function formatBillingCycle(cycle: string): string {
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getCategoryStats(
  items: Array<{ category?: string | null }>
): Array<{ category: string; count: number }> {
  const stats = new Map<string, number>();

  items.forEach((item) => {
    const cat = item.category || "Other";
    stats.set(cat, (stats.get(cat) || 0) + 1);
  });

  return Array.from(stats.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
