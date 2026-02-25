"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2,
  FileText,
  RefreshCw,
  Info,
} from "lucide-react";
import { DynamicFormFields } from "@/components/items/DynamicFormFields";
import { DeleteModal } from "@/components/common/DeleteModal";
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

const REMINDER_OPTIONS = [
  { label: "Default (7d)", value: "7" },
  { label: "14d", value: "14" },
  { label: "30d", value: "30" },
  { label: "60d", value: "60" },
];

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/items/${id}`);
      }, 800);
    });
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/v1/items/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setShowDeleteModal(false);
      router.push("/dashboard/items");
    } else {
      setShowDeleteModal(false);
      setError("Failed to delete item");
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-950 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          <div className="h-6 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-12 w-64 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-96 rounded-[2rem] bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-lg">Item not found.</p>
          <button
            onClick={() => router.push("/dashboard/items")}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:opacity-90 transition-opacity"
          >
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  const fieldsConfig = item.itemType?.fieldsConfig ?? [];
  const isDocument = item.itemClass === "document";
  const isSubscription = item.itemClass === "subscription";

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
            Items
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/dashboard/items/${id}`}
            className="hover:text-slate-300 transition-colors truncate max-w-[120px]"
          >
            {item.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-teal-400 font-medium">Edit</span>
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(`/dashboard/items/${id}`)}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Item
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Changes saved!</p>
              <p className="text-sm text-emerald-300/70">Redirecting…</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && !success && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form card */}
        <form onSubmit={handleSubmit}>
          <div className="relative rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Top glow edge */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50" />

            {/* Header */}
            <div className="flex items-center gap-4 p-8 pb-6 border-b border-white/5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  isSubscription
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-teal-500/20 text-teal-300"
                }`}
              >
                {isSubscription ? (
                  <RefreshCw className="h-6 w-6" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Edit Item</h1>
                {item.itemType && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {item.itemType.icon} {item.itemType.name}
                  </p>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Category display */}
              {item.itemType && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                  <span className="inline-block rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300">
                    {item.itemType.icon} {item.itemType.category}
                  </span>
                </div>
              )}

              {/* Date/financial fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {isDocument && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Document Number</label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Expiration Date (optional)</label>
                      <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition [color-scheme:dark]"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic fields */}
              {fieldsConfig.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-3">
                    {item.itemType?.icon} {item.itemType?.name} Details
                  </p>
                  <DynamicFormFields
                    fieldsConfig={fieldsConfig}
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
                      type="button"
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
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-gray-700/50 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-4 border-t border-white/5 px-8 py-5">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/items/${id}`)}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || success}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        title="Delete Item"
        itemName={item.name}
        itemIcon={item.itemType?.icon ?? undefined}
        itemDescription={item.itemType ? `${item.itemType.category} · ${item.itemType.name}` : undefined}
        permanent
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
