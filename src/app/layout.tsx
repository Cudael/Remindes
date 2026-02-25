import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remindes | Personal Reminder & Vault",
  description: "Your intelligent personal vault. Organize your subscriptions, track expiring documents, and never miss an important date again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Set the global background to slate-950 so that transitions 
  // between the landing page and dashboard are seamless and don't flash white.
  const bodyContent = (
    <body className="min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-teal-500/30 selection:text-teal-200">
      {children}
    </body>
  );

  // Fallback if the Clerk key is missing locally
  if (!clerkKey) {
    return (
      <html lang="en" className="dark">
        {bodyContent}
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        {bodyContent}
      </html>
    </ClerkProvider>
  );
}
