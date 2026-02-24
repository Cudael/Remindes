"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  Sparkles,
  Search,
  Plus,
  LayoutDashboard,
  List,
  CalendarDays,
  User,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  userImageUrl: string | null;
  isPremium: boolean;
}

const vaultLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "All Items", href: "/dashboard/items", icon: List, exact: false },
  {
    label: "Timeline",
    href: "/dashboard/timeline",
    icon: CalendarDays,
    exact: false,
  },
];

const preferenceLinks = [
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        active
          ? "bg-teal-500/15 text-teal-300 shadow-sm"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-400"
          style={{ boxShadow: "0 0 12px rgba(45,212,191,0.8)" }}
          aria-hidden="true"
        />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-teal-400" : "")} />
      {label}
    </Link>
  );
}

export function AppSidebar({
  userName,
  userEmail,
  userInitials,
  userImageUrl,
  isPremium,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    const base = href.split("?")[0];
    return pathname.startsWith(base);
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-40 bg-slate-950/50 backdrop-blur-3xl border-r border-white/5 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0 shadow-lg shadow-teal-500/20">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Remindes</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-5">
        <button
          className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-400 transition-all hover:bg-white/10 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Search vault (Command K)"
          title="Search vault (⌘K)"
        >
          <Search className="h-4 w-4 shrink-0 group-hover:text-teal-400 transition-colors" aria-hidden="true" />
          <span className="flex-1 text-left font-medium">Search vault...</span>
          <kbd className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 group-hover:text-white transition-colors border border-white/5">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8" aria-label="Main navigation">
        <div>
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Your Vault
          </p>
          <ul className="space-y-1">
            {vaultLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={isActive(link.href, link.exact)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Preferences
          </p>
          <ul className="space-y-1">
            {preferenceLinks.map((link) => (
              <li key={link.href}>
                <div className="relative">
                  <NavLink
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    active={isActive(link.href, false)}
                  />
                  {link.label === "Billing" && (
                    <span
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide border",
                        isPremium
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-slate-800/50 text-slate-400 border-slate-700/50"
                      )}
                    >
                      {isPremium ? "PRO" : "FREE"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User card */}
      <div className="border-t border-white/5 bg-black/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5">
          {userImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImageUrl}
              alt={userName}
              className="h-9 w-9 rounded-full object-cover shrink-0 ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0 ring-2 ring-white/10">
              <span className="text-xs font-bold text-white">{userInitials}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-[11px] text-slate-400 font-medium">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut(() => router.push("/"))}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
