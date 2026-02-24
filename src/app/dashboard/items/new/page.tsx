"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { DynamicFormFields } from "@/components/items/DynamicFormFields";
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

const STEPS = ["Classification", "Item Details", "Review & Confirm"];
const REMINDER_OPTIONS = [
  { label: "Default (7d)", value: "7" },
  { label: "14d", value: "14" },
  { label: "30d", value: "30" },
  { label: "60d", value: "60" },
];

export default function NewItemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);

  // Step 1
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItemTypeId, setSelectedItemTypeId] = useState("");
  const [name, setName] = useState("");

  // Step 2
  const [expirationDate, setExpirationDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string | number>>({});
  const [notes, setNotes] = useState("");
  const [reminderDaysBefore, setReminderDaysBefore] = useState("7");

  useEffect(() => {
    fetch("/api/v1/item-types")
      .then((r) => r.json())
      .then((json) => {
        const types: ItemType[] = json.data ?? [];
        setItemTypes(types);
        const cats = [...new Set(types.map((t) => t.category))].sort();
        setCategories(cats);
      })
      .catch(() => {
        setError("Failed to load item types");
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
    if (step === 0) return !!selectedItemTypeId && !!name.trim();
    return true;
  }

  function goTo(next: number) {
    if (next > step && !canAdvance()) return;
    setAnimDir(next > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 180);
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

  const translateClass = animating
    ? animDir === "forward"
      ? "-translate-x-4 opacity-0"
      : "translate-x-4 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/dashboard/items" className="hover:text-slate-300 transition-colors">
            Vault
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-teal-400 font-medium">Add Item</span>
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Add New Item</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
              {STEPS[step]}
            </p>
          </div>
          {/* Step badge */}
          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-xl px-4 py-2 text-sm font-semibold text-slate-300">
            Step <span className="text-teal-400">{step + 1}</span> / {STEPS.length}
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="relative h-1.5 flex-1 rounded-full overflow-hidden bg-white/5">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: i <= step ? "100%" : "0%",
                  background: i <= step
                    ? "linear-gradient(90deg, #14b8a6, #06b6d4)"
                    : "transparent",
                  boxShadow: i <= step ? "0 0 8px rgba(20,184,166,0.6)" : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Main form canvas */}
        <div className="relative rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top glow edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50" />

          <div
            className={`p-8 transition-all duration-200 ease-out ${translateClass}`}
          >
            {/* Step 1: Classification */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`rounded-xl px-4 py-1.5 text-sm font-semibold border transition-colors ${
                        selectedCategory === ""
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 border-transparent"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-xl px-4 py-1.5 text-sm font-semibold border transition-colors ${
                          selectedCategory === cat
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 border-transparent"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span className="mr-1.5">{getCategoryIcon(cat)}</span>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Item Type
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredTypes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedItemTypeId(t.id)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                          selectedItemTypeId === t.id
                            ? "border-teal-500/50 bg-teal-500/10 shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                            : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-2xl shrink-0">{t.icon ?? getCategoryIcon(t.category)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-white">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{t.description}</p>
                          )}
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-teal-400/80">
                            {t.category}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredTypes.length === 0 && (
                      <p className="col-span-2 text-sm text-slate-500 text-center py-6">
                        No item types found for this category.
                      </p>
                    )}
                  </div>
                </div>

                {/* Name field in step 1 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Item Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      selectedItemType ? `e.g. My ${selectedItemType.name}` : "Give this item a name"
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Item Details */}
            {step === 1 && (
              <div className="space-y-6">
                {selectedItemType && (
                  <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                    <span className="text-3xl">{selectedItemType.icon ?? getCategoryIcon(selectedItemType.category)}</span>
                    <div>
                      <p className="font-bold text-white">{name}</p>
                      <p className="text-xs text-slate-500">{selectedItemType.name} · {selectedItemType.category}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {isDocument && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Document Number</label>
                        <input
                          type="text"
                          value={documentNumber}
                          onChange={(e) => setDocumentNumber(e.target.value)}
                          placeholder="e.g. AB123456"
                          className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Expiration Date</label>
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition [color-scheme:dark]"
                        />
                      </div>
                    </>
                  )}
                  {isSubscription && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Billing Cycle</label>
                        <select
                          value={billingCycle}
                          onChange={(e) => setBillingCycle(e.target.value)}
                          className="w-full rounded-lg bg-slate-800 border border-gray-700/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        >
                          <option value="">Select…</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Renewal Date</label>
                        <input
                          type="date"
                          value={renewalDate}
                          onChange={(e) => setRenewalDate(e.target.value)}
                          className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition [color-scheme:dark]"
                        />
                      </div>
                    </>
                  )}
                </div>

                {selectedItemType && selectedItemType.fieldsConfig.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-3">
                      {selectedItemType.name} Details
                    </p>
                    <DynamicFormFields
                      fieldsConfig={selectedItemType.fieldsConfig}
                      values={dynamicFields}
                      onChange={handleDynamicChange}
                    />
                  </div>
                )}

                {/* Reminder schedule widget */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-300">
                      Custom reminder for this item. Choose how many days before expiration/renewal you want to be notified.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {REMINDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setReminderDaysBefore(opt.value)}
                        className={`rounded-xl px-4 py-1.5 text-sm font-semibold border transition-colors ${
                          reminderDaysBefore === opt.value
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 border-transparent"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes…"
                    className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Review &amp; Confirm</h2>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Name</span>
                    <span className="font-semibold text-white">{name}</span>
                  </div>
                  {selectedItemType && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Type</span>
                        <span className="font-semibold text-white">
                          {selectedItemType.icon} {selectedItemType.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Category</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                          {selectedItemType.category}
                        </span>
                      </div>
                    </>
                  )}
                  {expirationDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Expires</span>
                      <span className="font-semibold text-white">{expirationDate}</span>
                    </div>
                  )}
                  {renewalDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Renews</span>
                      <span className="font-semibold text-white">{renewalDate}</span>
                    </div>
                  )}
                  {price && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Price</span>
                      <span className="font-semibold text-white">
                        ${price}{billingCycle && ` / ${billingCycle}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Reminder</span>
                    <span className="font-semibold text-white">{reminderDaysBefore} days before</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-slate-400 shrink-0">Notes</span>
                      <span className="font-medium text-white text-right truncate max-w-[220px]">{notes}</span>
                    </div>
                  )}
                </div>

                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom nav bar */}
          <div className="flex items-center justify-between gap-4 border-t border-white/5 px-8 py-5">
            <button
              onClick={() => (step === 0 ? router.back() : goTo(step - 1))}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 0 ? "Cancel" : "Back"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => goTo(step + 1)}
                disabled={!canAdvance() || isPending}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-white transition-colors disabled:opacity-40"
              >
                Continue
                <ChevronRight className="h-4 w-4 text-teal-600" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm &amp; Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
