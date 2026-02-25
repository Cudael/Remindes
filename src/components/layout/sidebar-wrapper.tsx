'use client';

import { AppSidebar } from './app-sidebar-static';
import { useActiveRoute } from './use-active-route';

interface SidebarWrapperProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  userImageUrl: string | null;
  isPremium: boolean;
}

export function SidebarWrapper(props: SidebarWrapperProps) {
  const { isActive } = useActiveRoute();

  return <AppSidebar {...props} isActive={isActive} />;
}
