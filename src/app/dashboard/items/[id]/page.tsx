"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Edit, Trash2, Calendar, Hash, DollarSign, FileText } from "lucide-react";
import { CategoryBadge } from "@/components/items/CategoryBadge";
import { StatusIndicator } from "@/components/items/StatusIndicator";
import { getItemStatus, formatCurrency, formatBillingCycle } from "@/lib/item-utils";

interface ItemType {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  fieldsConfig: Array<{ key: string; label: string; type: string }>;
}

interface Attachment {
  id: string;
  fileId: string;
  file: { id: string; originalName: string; mimeType: string; size: number };
  createdAt: string;
}

interface Item {
  id: string;
  name: string;
  type?: string | null;
  category?: string | null;
  itemClass?: string | null;
  itemTypeId?: string | null;
  itemType?: ItemType | null;
  expirationDate?: string | null;
  renewalDate?: string | null;
  documentNumber?: string | null;
  billingCycle?: string | null;
  price?: number | null;
  notes?: string | null;
  dynamicFields?: Record<string, unknown> | null;
  reminderDaysBefore?: number | null;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/items/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setItem(json.data ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load item");
        setLoading(false);
      });
  }, [id]);

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this item?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/v1/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/items");
      } else {
        setError("Failed to delete item");
      }
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto max-w-2xl p-6 text-center">
        <p className="text-muted-foreground">Item not found.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/items")}>
          Back to Items
        </Button>
      </div>
    );
  }

  const { status, daysLeft } = getItemStatus(item);
  const category = item.category ?? item.itemType?.category ?? "Other";
  const icon = item.itemType?.icon ?? undefined;
  const fieldsConfig = item.itemType?.fieldsConfig ?? [];
  const dynamicFields = (item.dynamicFields as Record<string, unknown> | null) ?? {};

  function formatDate(d: string | null | undefined) {
    if (!d) return null;
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/items")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
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
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/items/${id}/edit`)}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

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
