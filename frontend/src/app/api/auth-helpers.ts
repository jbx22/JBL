/**
 * Next.js API route auth helpers — Supabase-backed.
 *
 * Uses Auth.js / NextAuth v5 JWT verification and Supabase for profile checks.
 */

import { auth } from "@/lib/auth";
import { supabase } from "@/db";
import { jsonHttpError } from "@/lib/http-error";

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
    throw jsonHttpError("Unauthorized", 401);
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("account_status")
    .eq("user_id", session.user.id as string)
    .maybeSingle();

  if (
    profile?.account_status === "suspended" ||
    profile?.account_status === "deleted"
  ) {
    throw jsonHttpError("Account is not active", 403);
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
