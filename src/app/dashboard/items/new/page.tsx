"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { DynamicFormFields } from "@/components/items/DynamicFormFields";
import { CategoryBadge } from "@/components/items/CategoryBadge";
import { getCategoryIcon } from "@/lib/item-utils";
import type { FieldConfig } from "@/components/items/DynamicFormFields";

interface ItemType {
  id: string;
  name: string;
  category: string;
  itemClass: string;
  description?: string | null;
  icon?: string | null;
  fieldsConfig: FieldConfig[];
}

const STEPS = ["Category & Type", "Basic Info", "Details", "Reminders", "Review"];

export default function NewItemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Step 1: Category & Type
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItemTypeId, setSelectedItemTypeId] = useState("");

  // Step 2: Basic Info
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  // Step 3: Details - Standard fields
  const [expirationDate, setExpirationDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string | number>>({});

  // Step 4: Reminders
  const [reminderDaysBefore, setReminderDaysBefore] = useState("7");

  useEffect(() => {
    fetch("/api/v1/item-types")
      .then((r) => r.json())
      .then((json) => {
        const types: ItemType[] = json.data ?? [];
        setItemTypes(types);
        const cats = [...new Set(types.map((t) => t.category))].sort();
        setCategories(cats);
      });
  }, []);

  const selectedItemType = itemTypes.find((t) => t.id === selectedItemTypeId) ?? null;
  const filteredTypes = itemTypes.filter(
    (t) => !selectedCategory || t.category === selectedCategory,
  );

  function handleDynamicChange(key: string, value: string | number) {
    setDynamicFields((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return !!selectedItemTypeId;
    if (step === 1) return !!name.trim();
    return true;
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const body: Record<string, unknown> = {
        name: name.trim(),
        notes: notes.trim() || undefined,
        reminderDaysBefore: Number(reminderDaysBefore) || 7,
        dynamicFields: Object.keys(dynamicFields).length > 0 ? dynamicFields : undefined,
      };

      if (selectedItemType) {
        body.itemTypeId = selectedItemType.id;
        body.category = selectedItemType.category;
        body.itemClass = selectedItemType.itemClass;
      }

      if (expirationDate) body.expirationDate = new Date(expirationDate).toISOString();
      if (renewalDate) body.renewalDate = new Date(renewalDate).toISOString();
      if (documentNumber) body.documentNumber = documentNumber;
      if (price) body.price = Number(price);
      if (billingCycle) body.billingCycle = billingCycle;

      const res = await fetch("/api/v1/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to create item");
        return;
      }

      const json = await res.json();
      router.push(`/dashboard/items/${json.data.id}`);
    });
  }

  const isDocument = selectedItemType?.itemClass === "document" || !selectedItemType;
  const isSubscription = selectedItemType?.itemClass === "subscription";

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Item</h1>
          <p className="text-muted-foreground text-sm">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Category & Type */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Category &amp; Type</CardTitle>
            <CardDescription>
              Choose what kind of item you want to add.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category selection */}
            <div>
              <Label className="mb-2 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="mr-1">{getCategoryIcon(cat)}</span>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Item type grid */}
            <div>
              <Label className="mb-2 block">Item Type</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedItemTypeId(t.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary ${
                      selectedItemTypeId === t.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <span className="text-2xl">{t.icon ?? getCategoryIcon(t.category)}</span>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.description}
                        </p>
                      )}
                      <CategoryBadge category={t.category} className="mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {filteredTypes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No item types found for this category.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            {selectedItemType && (
              <CardDescription>
                Adding a{" "}
                <strong>
                  {selectedItemType.icon} {selectedItemType.name}
                </strong>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={
                  selectedItemType ? `e.g. My ${selectedItemType.name}` : "Item name"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Any additional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Fill in the specific information for this item.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Standard fields based on itemClass */}
            <div className="grid gap-4 sm:grid-cols-2">
              {isDocument && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="documentNumber">Document Number</Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="e.g. AB123456"
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
                      placeholder="0.00"
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

            {/* Dynamic fields from item type config */}
            {selectedItemType && selectedItemType.fieldsConfig.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-3">
                  {selectedItemType.name} Details
                </p>
                <DynamicFormFields
                  fieldsConfig={selectedItemType.fieldsConfig}
                  values={dynamicFields}
                  onChange={handleDynamicChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Reminders */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>
              Configure when you want to be reminded before expiration or renewal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <p className="text-xs text-muted-foreground">
                You will be notified {reminderDaysBefore || 7} day
                {Number(reminderDaysBefore) !== 1 ? "s" : ""} before expiration or
                renewal.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review &amp; Create</CardTitle>
            <CardDescription>Confirm your item details before creating.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name}</span>
              </div>
              {selectedItemType && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {selectedItemType.icon} {selectedItemType.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <CategoryBadge category={selectedItemType.category} />
                  </div>
                </>
              )}
              {expirationDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">{expirationDate}</span>
                </div>
              )}
              {renewalDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renews</span>
                  <span className="font-medium">{renewalDate}</span>
                </div>
              )}
              {price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    ${price} {billingCycle && `/ ${billingCycle}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reminder</span>
                <span className="font-medium">{reminderDaysBefore} days before</span>
              </div>
              {notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="font-medium truncate max-w-[200px]">{notes}</span>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          disabled={isPending}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance() || isPending}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            <Check className="mr-1 h-4 w-4" />
            {isPending ? "Creating…" : "Create Item"}
          </Button>
        )}
      </div>
    </div>
  );
}
