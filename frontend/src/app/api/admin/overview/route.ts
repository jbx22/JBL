import { NextResponse } from "next/server";
import { supabase } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { errorToResponse } from "@/lib/http-error";

const numberValue = (value: unknown) => Number(value ?? 0);

export async function GET() {
  try {
    const principal = await requireAdmin();

    // --- Counts -----------------------------------------------------------
    const { data: allProfiles } = await supabase.from("user_profiles").select("user_id, role, account_status, message_credits_used");
    const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true });
    const { count: projectsCount } = await supabase.from("projects").select("*", { count: "exact", head: true });
    const { count: documentsCount } = await supabase.from("documents").select("*", { count: "exact", head: true });
    const { count: chatsCount } = await supabase.from("chats").select("*", { count: "exact", head: true });
    const { count: tabularReviewsCount } = await supabase.from("tabular_reviews").select("*", { count: "exact", head: true });

    const profiles = allProfiles ?? [];
    const activeUsers = profiles.filter((p) => p.account_status === "active").length;
    const suspendedUsers = profiles.filter((p) => p.account_status === "suspended").length;
    const admins = profiles.filter((p) => p.role === "admin" || p.role === "super_admin").length;
    const aiCreditsUsed = profiles.reduce((sum, p) => sum + numberValue(p.message_credits_used), 0);

    // --- Tiers -----------------------------------------------------------
    const tierMap: Record<string, number> = {};
    for (const p of profiles) {
      const tier = p.tier || "Free";
      tierMap[tier] = (tierMap[tier] || 0) + 1;
    }
    const tiers = Object.entries(tierMap).map(([tier, count]) => ({ tier, count }));

    // --- Subscriptions / financials --------------------------------------
    const { data: allSubs } = await supabase.from("subscriptions").select("*");
    const subs = allSubs ?? [];
    const paidSubs = subs.filter((s) => s.status === "paid");
    const pendingSubs = subs.filter((s) => s.status === "pending");
    const activeSubs = subs.filter((s) => s.status === "paid" || s.status === "active");

    const totalRevenueCents = paidSubs.reduce((sum, s) => sum + numberValue(s.amount_cents), 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const recentPaidSubs = paidSubs.filter((s) => s.created_at >= thirtyDaysAgo);
    const revenue30dCents = recentPaidSubs.reduce((sum, s) => sum + numberValue(s.amount_cents), 0);

    const payingUserIds = new Set(paidSubs.map((s) => s.user_id).filter(Boolean));

    // --- Recent users ----------------------------------------------------
    let recentQuery = supabase
      .from("users")
      .select("id, email, display_name")
      .order("created_at", { ascending: false })
      .limit(20);

    // Admin view scope: super_admin sees all, admin sees non-super-admins
    const { data: rawRecentUsers, error: recentErr } = await recentQuery;
    if (recentErr) throw recentErr;

    // Enrich with profile data
    const userIds = (rawRecentUsers ?? []).map((u) => u.id);
    const { data: profileMap } = userIds.length
      ? await supabase.from("user_profiles").select("*").in("user_id", userIds)
      : { data: [] as any[] };

    const profileByUserId: Record<string, any> = {};
    for (const p of profileMap ?? []) {
      profileByUserId[p.user_id] = p;
    }

    let recentUsers = (rawRecentUsers ?? []).map((u) => {
      const p = profileByUserId[u.id] ?? {};
      return {
        id: u.id,
        email: u.email ?? "",
        displayName: u.display_name,
        organisation: p.organisation ?? null,
        tier: p.tier ?? null,
        messageCreditsUsed: p.message_credits_used ?? null,
        role: p.role ?? null,
        accountStatus: p.account_status ?? null,
        createdAt: u.created_at ?? "",
      };
    });

    // Filter out super_admins for non-super-admin
    if (principal.role !== "super_admin") {
      recentUsers = recentUsers.filter(
        (u) => (u.role ?? "user") !== "super_admin"
      );
    }

    // --- Admins ----------------------------------------------------------
    let adminQuery = supabase
      .from("user_profiles")
      .select("user_id, role, account_status, suspension_reason, updated_at")
      .in("role", ["admin", "super_admin"]);

    if (principal.role !== "super_admin") {
      adminQuery = adminQuery.eq("role", "admin");
    }

    const { data: rawAdmins } = await adminQuery;
    const adminUserIds = (rawAdmins ?? []).map((a) => a.user_id);
    const { data: adminUserMap } = adminUserIds.length
      ? await supabase.from("users").select("id, email, display_name").in("id", adminUserIds)
      : { data: [] as any[] };

    const adminByUserId: Record<string, any> = {};
    for (const u of adminUserMap ?? []) {
      adminByUserId[u.id] = u;
    }

    const adminsList = (rawAdmins ?? []).map((a) => {
      const u = adminByUserId[a.user_id] ?? {};
      return {
        id: a.user_id,
        email: u.email ?? "",
        displayName: u.display_name ?? null,
        role: a.role,
        accountStatus: a.account_status,
        suspensionReason: a.suspension_reason ?? null,
        updatedAt: a.updated_at ?? "",
      };
    });

    // --- Audit logs ------------------------------------------------------
    const { data: auditLogs } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);

    const auditLogList = (auditLogs ?? []).map((l) => ({
      id: l.id,
      actorEmail: l.actor_email ?? null,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id ?? null,
      metadata: l.metadata ?? {},
      createdAt: l.created_at,
    }));

    // --- Signups per day (last 30 days) ----------------------------------
    // Use a simple approach: count from users table
    const { data: allUsers } = await supabase
      .from("users")
      .select("created_at");
    const signupBuckets: Record<string, number> = {};
    for (const u of allUsers ?? []) {
      const date = (u.created_at ?? "").slice(0, 10);
      if (date) {
        signupBuckets[date] = (signupBuckets[date] || 0) + 1;
      }
    }
    const signupsPerDay = Object.entries(signupBuckets)
      .filter(([date]) => date >= new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Revenue per day (last 30 days) ----------------------------------
    const revenueBuckets: Record<string, { total: number; count: number }> = {};
    for (const s of recentPaidSubs) {
      const date = (s.created_at ?? "").slice(0, 10);
      if (date) {
        if (!revenueBuckets[date]) revenueBuckets[date] = { total: 0, count: 0 };
        revenueBuckets[date].total += numberValue(s.amount_cents);
        revenueBuckets[date].count += 1;
      }
    }
    const revenuePerDay = Object.entries(revenueBuckets)
      .map(([date, v]) => ({ date, total: v.total, count: v.count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Building paying users list --------------------------------------
    const financials = {
      paidSubscriptions: paidSubs.length,
      pendingSubscriptions: pendingSubs.length,
      activeSubscriptions: activeSubs.length,
      totalRevenueCents,
      revenue30dCents,
      payingUsers: payingUserIds.size,
      averageRevenuePerPaidUserCents:
        payingUserIds.size > 0
          ? Math.round(totalRevenueCents / payingUserIds.size)
          : 0,
      currency: "SAR",
    };

    return NextResponse.json({
      principal,
      counts: {
        users: usersCount ?? 0,
        activeUsers,
        suspendedUsers,
        admins,
        projects: projectsCount ?? 0,
        documents: documentsCount ?? 0,
        chats: chatsCount ?? 0,
        tabularReviews: tabularReviewsCount ?? 0,
        aiCreditsUsed,
      },
      tiers,
      financials,
      signupsPerDay,
      revenuePerDay,
      recentUsers,
      admins: adminsList,
      auditLogs: auditLogList,
    });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/admin/overview error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
