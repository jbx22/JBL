/**
 * Next.js API route auth helpers — replaces backend/src/middleware/auth.ts.
 * Uses Auth.js / NextAuth v5 JWT verification instead of Supabase.
 */
import { auth } from "@/lib/auth";

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
