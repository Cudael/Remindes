import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

/**
 * Returns the current Clerk user id.
 * Throws (redirects to sign-in) if the user is not authenticated.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * Upserts a row in the Prisma User table keyed by clerkUserId.
 * Returns the database user record.
 */
export async function getOrCreateDbUser(clerkUserId: string) {
  return db.user.upsert({
    where: { clerkUserId },
    create: { clerkUserId },
    update: {},
  });
}
