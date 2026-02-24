import { currentUser } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/layout/app-sidebar";

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

      {/* Main content area (padded for sidebar on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}

