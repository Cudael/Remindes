"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Plus, LayoutGrid, List, AlertTriangle, Package } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { FilterBar } from "@/components/items/FilterBar";
import { StatsCard } from "@/components/items/StatsCard";
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
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isGridView, setIsGridView] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(() => {
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedStatus) params.status = selectedStatus;
    if (searchQuery) params.search = searchQuery;

    startTransition(async () => {
      const [itemsData, statsData, categoriesData] = await Promise.all([
        fetchItems(params),
        fetchStats(),
        fetchCategories(),
      ]);
      setItems(itemsData);
      setStats(statsData);
      setCategories(categoriesData);
    });
  }, [selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/v1/items/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    });
  }

  const expiredCount = items.filter((i) => getItemStatus(i).status === "expired").length;
  const expiringCount = items.filter((i) => getItemStatus(i).status === "expiring").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage your documents and subscriptions
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/items/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatsCard
            title="Total Items"
            value={stats.total}
            icon={<Package className="h-4 w-4" />}
          />
          <StatsCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            icon={<AlertTriangle className="h-4 w-4" />}
            colorClass={stats.expiringSoon > 0 ? "text-yellow-600" : "text-foreground"}
          />
          <StatsCard
            title="Expired"
            value={stats.expired}
            icon={<AlertTriangle className="h-4 w-4" />}
            colorClass={stats.expired > 0 ? "text-red-600" : "text-foreground"}
          />
          <StatsCard
            title="Monthly Cost"
            value={formatCurrency(stats.monthlySubscriptionCost)}
            icon={<span className="text-sm">💳</span>}
            description={`${stats.activeSubscriptions} active subscription${stats.activeSubscriptions !== 1 ? "s" : ""}`}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </CardContent>
      </Card>

      {/* Items list / grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Items</CardTitle>
              <CardDescription>
                {isPending
                  ? "Loading…"
                  : items.length === 0
                    ? "No items found. Create one above."
                    : `${items.length} item${items.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant={isGridView ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setIsGridView(true)}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={!isGridView ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setIsGridView(false)}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 && !isPending ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="font-semibold text-lg">No items yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                {selectedCategory || selectedStatus || searchQuery
                  ? "No items match your current filters."
                  : "Start by adding your first document or subscription."}
              </p>
              {!selectedCategory && !selectedStatus && !searchQuery && (
                <Button onClick={() => router.push("/dashboard/items/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              )}
            </div>
          ) : isGridView ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => router.push(`/dashboard/items/${item.id}`)}
                  onEdit={() => router.push(`/dashboard/items/${item.id}/edit`)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const { status, daysLeft } = getItemStatus(item);
                const statusColors = {
                  active: "text-green-600",
                  expiring: "text-yellow-600",
                  expired: "text-red-600",
                }[status];
                return (
                  <li
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors"
                    onClick={() => router.push(`/dashboard/items/${item.id}`)}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category ?? "Other"} · {item.itemType?.name ?? item.type ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {daysLeft != null && (
                        <span className={`text-sm font-medium ${statusColors}`}>
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)}d ago`
                            : daysLeft === 0
                              ? "Today"
                              : `${daysLeft}d`}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/items/${item.id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Warning banners */}
          {(expiredCount > 0 || expiringCount > 0) && !isPending && (
            <div className="mt-4 space-y-2">
              {expiredCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {expiredCount} item{expiredCount !== 1 ? "s have" : " has"} expired and may need renewal.
                  </span>
                </div>
              )}
              {expiringCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {expiringCount} item{expiringCount !== 1 ? "s are" : " is"} expiring within 30 days.
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

