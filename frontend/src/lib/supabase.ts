/**
 * Real Supabase server client factory.
 *
 * Replaces the old Drizzle-backed adapter that only mimicked the Supabase JS
 * client.  Now returns a genuine @supabase/supabase-js admin client so that
 * all existing code using `createServerSupabase()` works against real Supabase
 * REST + RLS.
 */

import { getSupabase } from "@/db";

/**
 * Create a server-side Supabase client with the service_role key.
 * Used by chatTools, userSettings, documentVersions, etc.
 */
export function createServerSupabase() {
  return getSupabase();
}

// Re-export the type so external consumers can reference it.
export type SupabaseClient = ReturnType<typeof createServerSupabase>;
