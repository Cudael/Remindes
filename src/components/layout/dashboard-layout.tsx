import { currentUser } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { db } from "@/server/db";
import { getItemStatus } from "@/lib/item-utils";
import { getOrCreateDbUser, requireUser } from "@/server/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function getInitials(firstName: string | null, lastName: string | null, email: string | null): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const clerkUserId = await requireUser();
  const dbUser = await getOrCreateDbUser(clerkUserId);
  const user = await currentUser();

  const userName =
    user?.firstName && user?.lastName
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

  // Fetch upcoming items for notifications
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingItems = await db.item.findMany({
    where: {
      ownerId: dbUser.id,
      OR: [
        { expirationDate: { gte: now, lte: thirtyDaysFromNow } },
        { renewalDate: { gte: now, lte: thirtyDaysFromNow } },
      ],
    },
    take: 8,
  });

  const notificationItems = upcomingItems.map((item) => {
    const { urgency } = getItemStatus(item);
    return {
      id: item.id,
      name: item.name,
      expirationDate: item.expirationDate,
      renewalDate: item.renewalDate,
      urgency,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fixed sidebar */}
      <AppSidebar
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        userImageUrl={userImageUrl}
        isPremium={isPremium}
      />

      {/* Main content area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        {/* Global Top Bar */}
        <DashboardTopBar
          pageTitle="Remindes"
          notificationItems={notificationItems}
          userName={userName}
          userEmail={userEmail}
          userInitials={userInitials}
          userImageUrl={userImageUrl}
          isPremium={isPremium}
        />
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
