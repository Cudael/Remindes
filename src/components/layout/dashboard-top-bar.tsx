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
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-white/5 bg-slate-950/60 backdrop-blur-2xl px-6 lg:px-8 shadow-sm">
      {/* Left: Optional page title or logo for mobile */}
      <h2 className="text-base font-semibold text-white tracking-tight hidden sm:block opacity-0">
        {pageTitle}
      </h2>
      
      {/* Mobile Branding */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">Remindes</span>
      </div>

      {/* Right side interactions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Upgrade pill */}
        {!isPremium && (
          <Link
            href="/dashboard/billing"
            className="group relative hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 overflow-hidden shadow-sm"
            aria-label="Upgrade to premium"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 group-hover:opacity-100 opacity-50 transition-opacity" />
            <div className="absolute inset-[1px] bg-slate-900 rounded-full" />
            <Sparkles className="h-3.5 w-3.5 relative z-10" aria-hidden="true" />
            <span className="relative z-10 tracking-wide">Upgrade Pro</span>
          </Link>
        )}

        {/* Divider */}
        {!isPremium && <div className="hidden sm:block h-6 w-px bg-white/10" aria-hidden="true" />}

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="group relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={`Notifications${hasNotifications ? ` (${notificationItems.length} items expiring soon)` : ""}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
            {hasNotifications && (
              <>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" aria-hidden="true" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
              </>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] w-80 rounded-[1.5rem] border border-white/10 bg-slate-900/80 backdrop-blur-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="border-b border-white/5 px-5 py-4">
                <p className="text-sm font-bold text-white tracking-tight">Notifications</p>
                {hasNotifications && (
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    {notificationItems.length} item{notificationItems.length !== 1 ? "s" : ""} expiring soon
                  </p>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto overscroll-contain">
                {notificationItems.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-3">
                      <Bell className="h-5 w-5 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">All caught up!</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5 p-2">
                    {notificationItems.map((item) => {
                      const date = item.expirationDate ?? item.renewalDate;
                      return (
                        <li key={item.id}>
                          <Link
                            href={`/dashboard/items/${item.id}`}
                            className="group flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-white/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:bg-white/5"
                            onClick={() => setNotifOpen(false)}
                          >
                            <div
                              className={cn(
                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                item.urgency === "high"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              )}
                            >
                              <AlertTriangle className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white tracking-tight">
                                {item.name}
                              </p>
                              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
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
            className="group flex items-center gap-3 rounded-full border border-white/5 bg-white/5 pl-2 pr-4 py-1.5 hover:bg-white/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 shadow-sm"
            aria-label="User menu"
            aria-expanded={avatarOpen}
            aria-haspopup="true"
          >
            {userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImageUrl}
                alt={userName}
                className="h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0 shadow-sm ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                <span className="text-[10px] font-extrabold text-white tracking-widest">{userInitials}</span>
              </div>
            )}
            <span className="hidden sm:block max-w-[120px] truncate text-sm font-semibold text-slate-300 tracking-tight">
              {userName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0 transition-transform duration-300 group-hover:text-slate-300" aria-hidden="true" />
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] mt-2 w-64 rounded-[1.5rem] border border-white/10 bg-slate-900/80 backdrop-blur-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="border-b border-white/5 px-5 py-4">
                <p className="truncate text-sm font-bold text-white tracking-tight">{userName}</p>
                <p className="truncate text-xs font-medium text-slate-400 mt-0.5">{userEmail}</p>
              </div>
              <div className="p-2">
                {[
                  { href: "/dashboard/profile", icon: User, label: "Profile" },
                  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:bg-white/5"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-white/5 p-2">
                <button
                  onClick={() => signOut(() => router.push("/"))}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  aria-label="Secure sign out"
                >
                  <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" aria-hidden="true" />
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
