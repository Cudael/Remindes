"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";
import { DynamicFormFields } from "@/components/items/DynamicFormFields";
import type { FieldConfig } from "@/components/items/DynamicFormFields";

interface ItemType {
  id: string;
  name: string;
  category: string;
  itemClass: string;
  icon?: string | null;
  fieldsConfig: FieldConfig[];
}

interface Item {
  id: string;
  name: string;
  category?: string | null;
  itemClass?: string | null;
  itemType?: ItemType | null;
  expirationDate?: string | null;
  renewalDate?: string | null;
  documentNumber?: string | null;
  billingCycle?: string | null;
  price?: number | null;
  notes?: string | null;
  dynamicFields?: Record<string, unknown> | null;
  reminderDaysBefore?: number | null;
}

function toDateInput(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string | number>>({});
  const [reminderDaysBefore, setReminderDaysBefore] = useState("7");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/items/${id}`)
      .then((r) => r.json())
      .then((json) => {
        const data: Item = json.data;
        if (data) {
          setItem(data);
          setName(data.name);
          setNotes(data.notes ?? "");
          setExpirationDate(toDateInput(data.expirationDate));
          setRenewalDate(toDateInput(data.renewalDate));
          setDocumentNumber(data.documentNumber ?? "");
          setPrice(data.price != null ? String(data.price) : "");
          setBillingCycle(data.billingCycle ?? "");
          setReminderDaysBefore(String(data.reminderDaysBefore ?? 7));
          if (data.dynamicFields && typeof data.dynamicFields === "object") {
            const df: Record<string, string | number> = {};
            for (const [k, v] of Object.entries(data.dynamicFields)) {
              if (typeof v === "string" || typeof v === "number") df[k] = v;
            }
            setDynamicFields(df);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function handleDynamicChange(key: string, value: string | number) {
    setDynamicFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(async () => {
      const body: Record<string, unknown> = {
        name: name.trim(),
        notes: notes.trim() || null,
        reminderDaysBefore: Number(reminderDaysBefore) || 7,
        dynamicFields: Object.keys(dynamicFields).length > 0 ? dynamicFields : null,
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null,
        renewalDate: renewalDate ? new Date(renewalDate).toISOString() : null,
        documentNumber: documentNumber || null,
        price: price ? Number(price) : null,
        billingCycle: billingCycle || null,
      };

      const res = await fetch(`/api/v1/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to update item");
        return;
      }

      router.push(`/dashboard/items/${id}`);
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
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

  const fieldsConfig = item.itemType?.fieldsConfig ?? [];
  const isDocument = item.itemClass === "document";
  const isSubscription = item.itemClass === "subscription";

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/items/${id}`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Item</h1>
          {item.itemType && (
            <p className="text-muted-foreground text-sm">
              {item.itemType.icon} {item.itemType.name}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>Update specific information for this item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {isDocument && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="documentNumber">Document Number</Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>
                </>
              )}
              {isSubscription && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                    <select
                      id="billingCycle"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                    >
                      <option value="">Select…</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="renewalDate">Renewal Date</Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {fieldsConfig.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-3">
                  {item.itemType?.icon} {item.itemType?.name} Details
                </p>
                <DynamicFormFields
                  fieldsConfig={fieldsConfig}
                  values={dynamicFields}
                  onChange={handleDynamicChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="reminderDays">Remind me (days before)</Label>
              <Input
                id="reminderDays"
                type="number"
                min="0"
                max="365"
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/items/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            <Save className="mr-1 h-4 w-4" />
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
