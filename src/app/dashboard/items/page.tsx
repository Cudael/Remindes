"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, SlidersHorizontal, AlertTriangle, Loader2, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { VaultItemCard } from "@/components/items/VaultItemCard";
import { VaultFilterPanel, type StatFilterValue, type CategoryFilter } from "@/components/items/VaultFilterPanel";
import { VaultInsights } from "@/components/items/VaultInsights";
import { VaultEmptyState } from "@/components/items/VaultEmptyState";
import { DeleteModal } from "@/components/common/DeleteModal";
import { getItemStatus } from "@/lib/item-utils";

const FREE_PLAN_LIMIT = 20;
const FREE_PLAN_WARN_AT = 15;

interface ItemType {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
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
  createdAt: string;
}

interface Stats {
  total: number;
  byCategory: Record<string, number>;
  byClass: Record<string, number>;
  expiringSoon: number;
  expired: number;
  activeSubscriptions: number;
  monthlySubscriptionCost: number;
}

// Map our UI stat-filter values to API status param values
function statFilterToApiStatus(filter: StatFilterValue): string {
  switch (filter) {
    case "soon": return "expiring";
    case "week": return "expiring";
    case "expired": return "expired";
    default: return "";
  }
}

async function fetchItems(params: Record<string, string> = {}): Promise<Item[]> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/items${qs ? `?${qs}` : ""}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function fetchStats(): Promise<Stats | null> {
  const res = await fetch("/api/v1/items/stats");
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

async function fetchCategories(): Promise<string[]> {
  const res = await fetch("/api/v1/item-types/categories");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export default function ItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const isPremium = user?.publicMetadata?.plan === "premium";

  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [activeCategory, setActiveCategory] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState<StatFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Read URL param on mount
  useEffect(() => {
    const filterParam = searchParams.get("filter") as StatFilterValue | null;
    if (filterParam) {
      setActiveStatFilter(filterParam);
      setShowFilters(true);
    }
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setShowFilters(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeStatFilter !== "all") params.set("filter", activeStatFilter);
    if (activeCategory) params.set("category", activeCategory);
    if (searchQuery) params.set("search", searchQuery);
    const qs = params.toString();
    router.replace(`/dashboard/items${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [activeStatFilter, activeCategory, searchQuery, router]);

  const loadData = useCallback(() => {
    const params: Record<string, string> = {};
    if (activeCategory) params.category = activeCategory;
    const apiStatus = statFilterToApiStatus(activeStatFilter);
    if (apiStatus) params.status = apiStatus;
    if (searchQuery) params.search = searchQuery;

    startTransition(async () => {
      const [itemsData, statsData, categoriesData, allItemsData] = await Promise.all([
        fetchItems(params),
        fetchStats(),
        fetchCategories(),
        fetchItems(), // unfiltered for counts
      ]);
      setItems(itemsData);
      setStats(statsData);
      setCategories(categoriesData);
      setAllItems(allItemsData);
    });
  }, [activeCategory, activeStatFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side filter for document/subscription class filters
  const filteredItems = items.filter((item) => {
    if (activeStatFilter === "documents") return item.itemClass !== "subscription";
    if (activeStatFilter === "subscriptions") return item.itemClass === "subscription";
    if (activeStatFilter === "missingDocs") return !item.documentNumber;
    return true;
  });

  const hasActiveFilters =
    activeStatFilter !== "all" || !!activeCategory || !!searchQuery;

  // Category filters with counts from unfiltered items
  const categoryFilters: CategoryFilter[] = categories.map((cat) => ({
    label: cat,
    value: cat,
    count: allItems.filter((i) => (i.category ?? i.itemType?.category ?? "Other") === cat).length,
  }));

  // Insights data
  const expiredCount = allItems.filter((i) => getItemStatus(i).status === "expired").length;
  const expiringCount = allItems.filter((i) => getItemStatus(i).status === "expiring").length;
  const documentsCount = allItems.filter((i) => i.itemClass !== "subscription").length;
  const subscriptionsCount = allItems.filter((i) => i.itemClass === "subscription").length;

  function handleStatFilter(key: string) {
    setActiveStatFilter(key as StatFilterValue);
  }

  function handleClearFilters() {
    setActiveStatFilter("all");
    setActiveCategory("");
    setSearchQuery("");
  }

  function openDeleteModal(item: Item) {
    setItemToDelete(item);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/items/${itemToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setItemToDelete(null);
        loadData();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const totalItems = allItems.length;
  const atLimit = !isPremium && totalItems >= FREE_PLAN_LIMIT;
  const nearLimit = !isPremium && totalItems >= FREE_PLAN_WARN_AT && totalItems < FREE_PLAN_LIMIT;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Grid mesh */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Teal gradient blobs */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 space-y-6 sm:px-6">

        {/* Top bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search vault…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              showFilters || hasActiveFilters
                ? "border-teal-500/30 bg-teal-500/10 text-teal-300"
                : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/10"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
            )}
          </button>

          {/* New Item */}
          <button
            onClick={() => router.push("/dashboard/items/new")}
            className="flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Item
          </button>
        </div>

        {/* Filter panel (slide-down) */}
        <div
          className="overflow-hidden transition-all duration-200 ease-out"
          style={{ maxHeight: showFilters ? "600px" : "0px" }}
        >
          <VaultFilterPanel
            activeCategory={activeCategory}
            activeStatFilter={activeStatFilter}
            categoryFilters={categoryFilters}
            hasActiveFilters={hasActiveFilters}
            onCategoryChange={setActiveCategory}
            onStatFilterChange={setActiveStatFilter}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Insights accordion */}
        <VaultInsights
          showInsights={showInsights}
          onToggle={() => setShowInsights((v) => !v)}
          insights={{ needsAttention: expiredCount, expiringThisMonth: expiringCount }}
          documentsCount={documentsCount}
          subscriptionsCount={subscriptionsCount}
          onFilter={handleStatFilter}
        />

        {/* Item limit banner */}
        {atLimit && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
            <div className="flex-1 text-sm text-rose-200">
              <span className="font-semibold">Vault full.</span> You&apos;ve reached the {FREE_PLAN_LIMIT}-item limit on the free plan.
            </div>
            <button className="shrink-0 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        )}

        {nearLimit && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="flex-1 text-sm text-amber-200">
              <span className="font-semibold">{totalItems}/{FREE_PLAN_LIMIT} items used.</span> Upgrade to Pro for unlimited items.
            </p>
            <button className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Loading */}
        {isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        )}

        {/* Items grid / empty state */}
        {!isPending && (
          filteredItems.length === 0 ? (
            <VaultEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <VaultItemCard
                  key={item.id}
                  item={item}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )
        )}

        {/* Item count footer */}
        {!isPending && filteredItems.length > 0 && (
          <p className="text-center text-xs text-slate-600">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            {stats ? ` · ${stats.total} total in vault` : ""}
          </p>
        )}
      </div>

      {/* Delete modal — keyed so it remounts (fresh state) for each item */}
      <DeleteModal
        key={itemToDelete?.id ?? "none"}
        show={!!itemToDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        itemName={itemToDelete?.name}
        itemDescription={itemToDelete?.category ?? itemToDelete?.itemType?.category ?? undefined}
        itemIcon={itemToDelete?.itemType?.icon ?? undefined}
        permanent
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}

