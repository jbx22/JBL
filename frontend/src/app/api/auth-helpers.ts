/**
 * Next.js API route auth helpers — replaces backend/src/middleware/auth.ts.
 * Uses Auth.js / NextAuth v5 JWT verification instead of Supabase.
 */
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthUser {
  userId: string;
  userEmail: string;
}

/**
 * Verify the user is authenticated via Auth.js session.
 * Throws a Response (Next.js error convention) if unauthorized.
 */
export async function requireAuth(): Promise<AuthUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw Response.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const [profile] = await db
    .select({ account_status: userProfiles.account_status })
    .from(userProfiles)
    .where(eq(userProfiles.user_id, session.user.id as string))
    .limit(1);

  if (profile?.account_status === "suspended" || profile?.account_status === "deleted") {
    throw Response.json({ detail: "Account is not active" }, { status: 403 });
  }

  return {
    userId: session.user.id as string,
    userEmail: (session.user.email as string)?.toLowerCase() ?? "",
  };
}

/**
 * Optional auth — returns user or null without throwing.
 */
export async function optionalAuth(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id as string,
    userEmail: (session.user.email as string)?.toLowerCase() ?? "",
  };
}
