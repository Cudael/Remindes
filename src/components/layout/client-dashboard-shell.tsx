'use client';

import { useEffect, useState, memo } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from './app-sidebar';
import { DashboardTopBar } from './dashboard-top-bar';
import { PageContentWrapper } from './page-content-wrapper';

interface NotificationItem {
  id: string;
  name: string;
  expirationDate: Date | null;
  renewalDate: Date | null;
  urgency: "low" | "medium" | "high";
}

function getInitials(firstName: string | null, lastName: string | null, email: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export const ClientDashboardShell = memo(function ClientDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "User";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const userInitials = getInitials(
    user?.firstName ?? null,
    user?.lastName ?? null,
    userEmail || null
  );
  const userImageUrl = user?.imageUrl ?? null;
  const isPremium = user?.publicMetadata?.plan === "premium";

  useEffect(() => {
    fetch('/api/v1/items/upcoming')
      .then((r) => r.json())
      .then((body: { data?: NotificationItem[] }) => setNotifications(body.data ?? []))
      .catch(console.error);
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        userImageUrl={userImageUrl}
        isPremium={isPremium}
      />

      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <DashboardTopBar
          pageTitle="Remindes"
          notificationItems={notifications}
          userName={userName}
          userEmail={userEmail}
          userInitials={userInitials}
          userImageUrl={userImageUrl}
          isPremium={isPremium}
        />

        <main className="flex-1">
          <PageContentWrapper>
            {children}
          </PageContentWrapper>
        </main>
      </div>
    </div>
  );
});
