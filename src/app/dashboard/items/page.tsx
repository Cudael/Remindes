"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
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

const VALID_STAT_FILTERS: ReadonlySet<StatFilterValue> = new Set([
  "all",
  "soon",
  "week",
  "expired",
  "documents",
  "subscriptions",
  "missingDocs",
]);

function isValidStatFilter(v: string | null): v is StatFilterValue {
  return v !== null && VALID_STAT_FILTERS.has(v as StatFilterValue);
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
  const initializedFromUrl = useRef(false);

  // Debounced search value to avoid firing API calls on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // Read URL params on first mount only
  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;
    const filterParam = searchParams.get("filter");
    if (isValidStatFilter(filterParam)) {
      setActiveStatFilter(filterParam);
      setShowFilters(true);
    }
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setShowFilters(true);
    }
  }, [searchParams]);

  // Sync URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeStatFilter !== "all") params.set("filter", activeStatFilter);
    if (activeCategory) params.set("category", activeCategory);
    if (debouncedSearch) params.set("search", debouncedSearch);
    const qs = params.toString();
    router.replace(`/dashboard/items${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [activeStatFilter, activeCategory, debouncedSearch, router]);

  const loadData = useCallback(() => {
    const params: Record<string, string> = {};
    if (activeCategory) params.category = activeCategory;
    const apiStatus = statFilterToApiStatus(activeStatFilter);
    if (apiStatus) params.status = apiStatus;
    if (debouncedSearch) params.search = debouncedSearch;

    startTransition(async () => {
      // Fetch filtered items, stats, and categories in parallel
      // Stats already contains counts, so no need for a separate unfiltered fetch
      const [itemsData, statsData, categoriesData, allItemsData] = await Promise.all([
        fetchItems(params),
        fetchStats(),
        fetchCategories(),
        // Only fetch unfiltered items if we have active filters, otherwise reuse filtered results
        (activeCategory || apiStatus || debouncedSearch) ? fetchItems() : Promise.resolve(null),
      ]);
      setItems(itemsData);
      setStats(statsData);
      setCategories(categoriesData);
      setAllItems(allItemsData ?? itemsData);
    });
  }, [activeCategory, activeStatFilter, debouncedSearch]);

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
  const categoryFilters: CategoryFilter[] = useMemo(() => categories.map((cat) => ({
    label: cat,
    value: cat,
    count: allItems.filter((i) => (i.category ?? i.itemType?.category ?? "Other") === cat).length,
  })), [categories, allItems]);

  // Insights data
  const expiredCount = useMemo(() => allItems.filter((i) => getItemStatus(i).status === "expired").length, [allItems]);
  const expiringCount = useMemo(() => allItems.filter((i) => getItemStatus(i).status === "expiring").length, [allItems]);
  const documentsCount = useMemo(() => allItems.filter((i) => i.itemClass !== "subscription").length, [allItems]);
  const subscriptionsCount = useMemo(() => allItems.filter((i) => i.itemClass === "subscription").length, [allItems]);

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

      {/* Restrained container for the main content */}
      <div className="relative z-10 mx-auto max-w-6xl w-full px-4 py-8 space-y-8 sm:px-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your Vault</h1>
            <p className="text-base font-medium text-slate-400">
              Manage and organize all your important documents and subscriptions.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/items/new")}
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-slate-100 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-white/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Add New Item
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          {/* Search */}
          <div className="relative w-full sm:w-96 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search your vault…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl pl-11 pr-10 py-3 text-sm font-medium text-white placeholder:text-slate-500 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition-all hover:bg-slate-900/80"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? "border-teal-500/30 bg-teal-500/10 text-teal-300 shadow-md shadow-teal-500/10"
                : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/10 hover:bg-slate-900/80"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
            )}
          </button>
        </div>

        {/* Filter panel (slide-down) */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: showFilters ? "1200px" : "0px", opacity: showFilters ? 1 : 0 }}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[1.5rem] border border-rose-500/30 bg-rose-500/10 px-6 py-4 backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
              </span>
              <div className="text-sm text-rose-200">
                <span className="font-bold text-rose-100">Vault full.</span> You&apos;ve reached the {FREE_PLAN_LIMIT}-item limit on the free plan.
              </div>
            </div>
            <button className="sm:ml-auto w-full sm:w-auto shrink-0 rounded-xl bg-rose-500 px-5 py-2 text-xs font-bold text-white hover:bg-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              Upgrade to Pro
            </button>
          </div>
        )}

        {nearLimit && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 px-6 py-4 backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200">
                <span className="font-bold text-amber-100">{totalItems}/{FREE_PLAN_LIMIT} items used.</span> Upgrade to Pro for unlimited items.
              </p>
            </div>
            <button className="sm:ml-auto w-full sm:w-auto shrink-0 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Loading */}
        {isPending && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
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
          <div className="flex justify-center pt-8">
            <p className="rounded-full border border-white/5 bg-slate-900/50 px-4 py-1.5 text-xs font-medium text-slate-500 backdrop-blur-md">
              Showing {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              {stats && filteredItems.length !== stats.total ? ` out of ${stats.total} total` : ""}
            </p>
          </div>
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
