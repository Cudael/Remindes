import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import { StatusIndicator } from "./StatusIndicator";
import { getItemStatus, formatCurrency } from "@/lib/item-utils";

interface ItemType {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
}

interface Item {
  id: string;
  name: string;
  category?: string | null;
  itemClass?: string | null;
  itemType?: ItemType | null;
  expirationDate?: string | Date | null;
  renewalDate?: string | Date | null;
  price?: number | null;
  billingCycle?: string | null;
  documentNumber?: string | null;
  createdAt: string | Date;
}

interface ItemCardProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function ItemCard({ item, onEdit, onDelete, onClick }: ItemCardProps) {
  const { status, daysLeft } = getItemStatus(item);
  const category = item.category ?? item.itemType?.category ?? "Other";
  const icon = item.itemType?.icon ?? undefined;
  const typeName = item.itemType?.name ?? item.itemClass ?? null;

  const borderColors = {
    active: "border-l-green-400",
    expiring: "border-l-yellow-400",
    expired: "border-l-red-400",
  }[status];

  return (
    <div
      className={`group relative rounded-lg border border-border bg-card border-l-4 ${borderColors} p-4 shadow-sm transition-all hover:shadow-md cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryBadge category={category} icon={icon} />
            {item.itemClass && (
              <span className="text-xs text-muted-foreground capitalize">
                {item.itemClass}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          {typeName && (
            <p className="text-xs text-muted-foreground mt-0.5">{typeName}</p>
          )}
          {item.price != null && (
            <p className="text-xs font-medium text-foreground mt-1">
              {formatCurrency(item.price)}
              {item.billingCycle && (
                <span className="text-muted-foreground">/{item.billingCycle}</span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusIndicator status={status} daysLeft={daysLeft} />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label={`Edit ${item.name}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
