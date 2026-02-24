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
        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        active
          ? "bg-teal-500/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-teal-400"
          style={{ boxShadow: "0 0 10px rgba(45,212,191,1)" }}
          aria-hidden="true"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
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
    <aside className="hidden lg:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Remindes</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <button
          className="flex w-full items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Search vault (Command K)"
          title="Search vault (⌘K)"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">Search vault...</span>
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* New Item */}
      <div className="px-4 pt-3">
        <Link
          href="/dashboard/items/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Add new item"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Item
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6" aria-label="Main navigation">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Your Vault
          </p>
          <ul className="space-y-0.5">
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
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Preferences
          </p>
          <ul className="space-y-0.5">
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
                        "absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        isPremium
                          ? "bg-teal-500/20 text-teal-400"
                          : "bg-slate-700 text-slate-400"
                      )}
                    >
                      {isPremium ? "Pro" : "Free"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User card */}
      <div className="border-t border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          {userImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImageUrl}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0">
              <span className="text-xs font-semibold text-white">{userInitials}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-xs text-slate-500">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut(() => router.push("/"))}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
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
