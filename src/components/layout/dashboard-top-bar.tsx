"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  Sparkles,
  Bell,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  name: string;
  expirationDate: Date | null;
  renewalDate: Date | null;
  urgency: "low" | "medium" | "high";
}

interface DashboardTopBarProps {
  pageTitle: string;
  notificationItems: NotificationItem[];
  userName: string;
  userEmail: string;
  userInitials: string;
  userImageUrl: string | null;
  isPremium: boolean;
}

function formatRelativeDate(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diff = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Expired";
  if (diff === 0) return "Expires today";
  return `In ${diff} day${diff !== 1 ? "s" : ""}`;
}

export function DashboardTopBar({
  pageTitle,
  notificationItems,
  userName,
  userEmail,
  userInitials,
  userImageUrl,
  isPremium,
}: DashboardTopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasNotifications = notificationItems.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-6">
      {/* Left: page title */}
      <h2 className="text-base font-semibold text-white">{pageTitle}</h2>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Upgrade pill */}
        {!isPremium && (
          <Link
            href="/dashboard/billing"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400 hover:bg-teal-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Upgrade to premium"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Upgrade
          </Link>
        )}

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" aria-hidden="true" />

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={`Notifications${hasNotifications ? ` (${notificationItems.length} items expiring soon)` : ""}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {hasNotifications && (
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"
                aria-hidden="true"
              />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="border-b border-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {hasNotifications && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {notificationItems.length} item{notificationItems.length !== 1 ? "s" : ""}{" "}
                    expiring soon
                  </p>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No pending notifications
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {notificationItems.map((item) => {
                      const date = item.expirationDate ?? item.renewalDate;
                      return (
                        <li key={item.id}>
                          <Link
                            href={`/dashboard/items/${item.id}`}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:bg-white/5"
                            onClick={() => setNotifOpen(false)}
                          >
                            <div
                              className={cn(
                                "mt-0.5 shrink-0 rounded-full p-1.5",
                                item.urgency === "high"
                                  ? "bg-rose-500/20"
                                  : "bg-orange-500/20"
                              )}
                            >
                              <AlertTriangle
                                className={cn(
                                  "h-3.5 w-3.5",
                                  item.urgency === "high"
                                    ? "text-rose-400"
                                    : "text-orange-400"
                                )}
                                aria-hidden="true"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {item.name}
                              </p>
                              <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                {formatRelativeDate(date)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setAvatarOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-2 py-1.5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="User menu"
            aria-expanded={avatarOpen}
            aria-haspopup="true"
          >
            {userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImageUrl}
                alt={userName}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0">
                <span className="text-[10px] font-semibold text-white">{userInitials}</span>
              </div>
            )}
            <span className="hidden sm:block max-w-[100px] truncate text-sm font-medium text-slate-300">
              {userName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="border-b border-white/5 px-4 py-3">
                <p className="truncate text-sm font-medium text-white">{userName}</p>
                <p className="truncate text-xs text-slate-500">{userEmail}</p>
              </div>
              <div className="p-1.5">
                {[
                  { href: "/dashboard/profile", icon: User, label: "Profile" },
                  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors focus-visible:outline-none focus-visible:bg-white/5"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-white/5 p-1.5">
                <button
                  onClick={() => signOut(() => router.push("/"))}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  aria-label="Secure sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Secure Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
