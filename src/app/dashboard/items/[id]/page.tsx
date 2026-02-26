import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Hash, DollarSign, FileText } from "lucide-react";
import { CategoryBadge } from "@/components/items/CategoryBadge";
import { StatusIndicator } from "@/components/items/StatusIndicator";
import { ItemDetailActions } from "@/components/items/ItemDetailActions";
import { getItemStatus, formatCurrency, formatBillingCycle } from "@/lib/item-utils";
import { requireUser, getOrCreateDbUser } from "@/server/auth";
import { db } from "@/server/db";

function formatDate(d: Date | string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clerkUserId = await requireUser();
  const user = await getOrCreateDbUser(clerkUserId);

  const item = await db.item.findUnique({
    where: { id },
    include: {
      itemType: true,
      attachments: { include: { file: true } },
    },
  });

  if (!item || item.ownerId !== user.id) {
    notFound();
  }

  const { status, daysLeft } = getItemStatus(item);
  const category = item.category ?? item.itemType?.category ?? "Other";
  const icon = item.itemType?.icon ?? undefined;
  const fieldsConfig = (item.itemType?.fieldsConfig as Array<{ key: string; label: string; type: string }>) ?? [];
  const dynamicFields = (item.dynamicFields as Record<string, unknown> | null) ?? {};

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      {/* Header with client-side actions */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryBadge category={category} icon={icon} />
            <StatusIndicator status={status} daysLeft={daysLeft} />
          </div>
          <h1 className="text-2xl font-bold truncate">{item.name}</h1>
          {item.itemType && (
            <p className="text-muted-foreground text-sm">
              {item.itemType.icon} {item.itemType.name}
            </p>
          )}
        </div>
      </div>

      <ItemDetailActions itemId={id} />

      {/* Key Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {item.expirationDate && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Expires: </span>
                <span className="font-medium">{formatDate(item.expirationDate)}</span>
                {daysLeft != null && (
                  <span className={`ml-2 text-xs ${
                    status === "expired" ? "text-red-600" :
                    status === "expiring" ? "text-yellow-600" : "text-green-600"
                  }`}>
                    ({daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`})
                  </span>
                )}
              </div>
            </div>
          )}
          {item.renewalDate && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Renews: </span>
                <span className="font-medium">{formatDate(item.renewalDate)}</span>
              </div>
            </div>
          )}
          {item.documentNumber && (
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Document #: </span>
                <span className="font-medium font-mono">{item.documentNumber}</span>
              </div>
            </div>
          )}
          {item.price != null && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Price: </span>
                <span className="font-medium">
                  {formatCurrency(item.price)}
                  {item.billingCycle && (
                    <span className="text-muted-foreground">
                      {" / "}{formatBillingCycle(item.billingCycle)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
          {item.reminderDaysBefore != null && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground text-xs ml-7">
                Reminder: {item.reminderDaysBefore} days before
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic fields */}
      {fieldsConfig.length > 0 && Object.keys(dynamicFields).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {item.itemType?.icon} {item.itemType?.name} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 sm:grid-cols-2">
              {fieldsConfig.map((field) => {
                const val = dynamicFields[field.key];
                if (!val) return null;
                return (
                  <div key={field.key} className="text-sm">
                    <dt className="text-muted-foreground">{field.label}</dt>
                    <dd className="font-medium">{String(val)}</dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {item.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {item.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {item.attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="truncate">{att.file.originalName}</span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {(att.file.size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Created: {formatDate(item.createdAt)}</p>
          <p>Last updated: {formatDate(item.updatedAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
