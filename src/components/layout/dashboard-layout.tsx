import { ClientDashboardShell } from "@/components/layout/client-dashboard-shell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <ClientDashboardShell>{children}</ClientDashboardShell>;
}
