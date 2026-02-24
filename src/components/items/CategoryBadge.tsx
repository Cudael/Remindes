import { getCategoryIcon } from "@/lib/item-utils";

interface CategoryBadgeProps {
  category: string;
  icon?: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  Travel: "bg-blue-100 text-blue-800",
  Identification: "bg-purple-100 text-purple-800",
  Financial: "bg-green-100 text-green-800",
  Subscription: "bg-orange-100 text-orange-800",
  Subscriptions: "bg-orange-100 text-orange-800",
  Insurance: "bg-indigo-100 text-indigo-800",
  Legal: "bg-yellow-100 text-yellow-800",
  Education: "bg-pink-100 text-pink-800",
  Health: "bg-red-100 text-red-800",
  Other: "bg-gray-100 text-gray-800",
};

export function CategoryBadge({ category, icon, className = "" }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] ?? "bg-gray-100 text-gray-800";
  const displayIcon = icon ?? getCategoryIcon(category);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}
    >
      <span>{displayIcon}</span>
      <span>{category}</span>
    </span>
  );
}
