"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  LayoutGrid,
  X,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  category?: string | null;
  itemClass?: string | null;
  itemType?: { name: string; icon?: string | null; category: string } | null;
  expirationDate?: string | null;
  renewalDate?: string | null;
}

function getDaysUntil(item: Item): number | null {
  const d = item.expirationDate ?? item.renewalDate;
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysUntilText(item: Item): string {
  const d = getDaysUntil(item);
  if (d === null) return "";
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return "Today";
  return `in ${d}d`;
}

function getDaysUntilColor(item: Item): string {
  const d = getDaysUntil(item);
  if (d === null) return "text-slate-400";
  if (d <= 7) return "text-rose-400";
  if (d <= 30) return "text-amber-400";
  return "text-teal-400";
}

function getItemPillClasses(item: Item): string {
  const d = getDaysUntil(item);
  if (d === null) return "bg-slate-700/50 border-slate-600/30 text-slate-300";
  if (d <= 7) return "bg-rose-500/15 border-rose-500/25 text-rose-300";
  if (d <= 30) return "bg-amber-500/15 border-amber-500/25 text-amber-300";
  return "bg-teal-500/15 border-teal-500/25 text-teal-300";
}

function getItemIconClasses(item: Item): string {
  const d = getDaysUntil(item);
  if (d === null) return "bg-slate-700 text-slate-400";
  if (d <= 7) return "bg-rose-500/20 text-rose-400";
  if (d <= 30) return "bg-amber-500/20 text-amber-400";
  return "bg-teal-500/20 text-teal-400";
}

function getItemDate(item: Item): Date | null {
  const d = item.expirationDate ?? item.renewalDate;
  return d ? new Date(d) : null;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayModalProps {
  date: Date;
  items: Item[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function DayModal({ date, items, onClose, onNavigate }: DayModalProps) {
  const label = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Ambient top glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">{label}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-left hover:bg-white/10 transition-colors group"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getItemIconClasses(item)}`}>
                {item.itemType?.icon ?? (item.itemClass === "subscription" ? "🔄" : "📄")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {item.itemType?.category ?? item.category ?? ""}
                </p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${getDaysUntilColor(item)}`}>
                {getDaysUntilText(item)}
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function TimelinePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    fetch("/api/v1/items")
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build map: dateKey -> items
  const itemsByDate = new Map<string, Item[]>();
  for (const item of items) {
    const d = getItemDate(item);
    if (!d) continue;
    const key = toDateKey(d);
    if (!itemsByDate.has(key)) itemsByDate.set(key, []);
    itemsByDate.get(key)!.push(item);
  }

  // Items this month
  const itemsThisMonth = items.filter((item) => {
    const d = getItemDate(item);
    if (!d) return false;
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }

  const todayKey = toDateKey(today);

  // List view: sorted unique dates with items this month
  const listDates = [...itemsByDate.entries()]
    .filter(([key]) => {
      const [y, m] = key.split("-").map(Number);
      return y === currentYear && m === currentMonth + 1;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  const modalItems = modalDate ? (itemsByDate.get(toDateKey(modalDate)) ?? []) : [];

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
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-3xl" />

      <div className="relative p-4 lg:p-8 space-y-6">
        {/* Top bar */}
        <div className="relative rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 lg:p-5">
            {/* Month navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrevMonth}
                className="rounded-xl bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white leading-none">
                  {formatMonthYear(currentYear, currentMonth)}
                </h1>
                <p className="text-xs text-indigo-400 mt-0.5 font-medium">
                  {itemsThisMonth.length} item{itemsThisMonth.length !== 1 ? "s" : ""} this month
                </p>
              </div>
              <button
                onClick={goToNextMonth}
                className="rounded-xl bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="hidden xl:flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> &lt; 7 days
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> &lt; 30 days
                </span>
                <span className="flex items-center gap-1.5 text-teal-400">
                  <span className="h-2 w-2 rounded-full bg-teal-400" /> Future
                </span>
              </div>

              {/* Today button */}
              <button
                onClick={goToToday}
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Today
              </button>

              {/* View toggle */}
              <div className="flex rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => setView("calendar")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                    view === "calendar"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                  aria-label="Calendar view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                    view === "list"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        )}

        {/* Calendar view */}
        {!loading && view === "calendar" && (
          <div className="rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-white/3 border-b border-white/5">
              {DAY_HEADERS.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[120px] bg-slate-900" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentYear, currentMonth, day);
                const key = toDateKey(date);
                const dayItems = itemsByDate.get(key) ?? [];
                const isToday = key === todayKey;
                const hasItems = dayItems.length > 0;
                const visibleItems = dayItems.slice(0, 3);
                const moreCount = dayItems.length - 3;

                return (
                  <div
                    key={day}
                    onClick={() => hasItems && setModalDate(date)}
                    className={`relative min-h-[120px] bg-slate-900 p-2 transition-colors ${
                      hasItems ? "cursor-pointer hover:bg-slate-800/80" : ""
                    }`}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? "bg-indigo-500 text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {day}
                      </span>
                      {hasItems && (
                        <span className="text-[10px] font-bold text-slate-500">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    {/* Item pills */}
                    <div className="space-y-0.5">
                      {visibleItems.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold truncate leading-tight ${getItemPillClasses(item)}`}
                          title={item.name}
                        >
                          {item.itemType?.icon ?? ""} {item.name}
                        </div>
                      ))}
                      {moreCount > 0 && (
                        <div className="text-[10px] font-bold text-slate-500 pl-1">
                          +{moreCount} more
                        </div>
                      )}
                    </div>

                    {/* Hover expand hint */}
                    {hasItems && (
                      <ArrowUpRight className="absolute bottom-1.5 right-1.5 h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List view */}
        {!loading && view === "list" && (
          <div className="space-y-4">
            {listDates.length === 0 && (
              <div className="rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl p-12 text-center">
                <CalendarDays className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-400 font-semibold">No items this month</p>
                <p className="text-sm text-slate-600 mt-1">Items with expiration or renewal dates will appear here.</p>
              </div>
            )}
            {listDates.map(([key, dateItems]) => {
              const [y, m, d] = key.split("-").map(Number);
              const date = new Date(y, m - 1, d);
              const label = date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              });

              return (
                <div
                  key={key}
                  className="relative rounded-[2rem] border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-30" />
                  {/* Date header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
                        <CalendarDays className="h-4 w-4 text-indigo-400" />
                      </div>
                      <p className="font-bold text-white">{label}</p>
                    </div>
                    <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                      {dateItems.length} item{dateItems.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-white/5">
                    {dateItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/items/${item.id}`)}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${getItemIconClasses(item)}`}>
                          {item.itemType?.icon ?? (item.itemClass === "subscription" ? "🔄" : "📄")}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-semibold text-white truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {item.itemType?.category ?? item.category ?? ""}
                          </p>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${getDaysUntilColor(item)}`}>
                          {getDaysUntilText(item)}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day Modal */}
      {modalDate && (
        <DayModal
          date={modalDate}
          items={modalItems}
          onClose={() => setModalDate(null)}
          onNavigate={(id) => router.push(`/dashboard/items/${id}`)}
        />
      )}
    </div>
  );
}
