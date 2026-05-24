import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  adminAuditLogs,
  chats,
  documents,
  projects,
  subscriptions,
  tabularReviews,
  userProfiles,
  users,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { errorToResponse } from "@/lib/http-error";
import { desc, eq, sql } from "drizzle-orm";

const numberValue = (value: unknown) => Number(value ?? 0);

export async function GET() {
  try {
    const principal = await requireAdmin();

    const [counts] = await db
      .select({
        users: sql<number>`count(distinct ${users.id})`,
        activeUsers: sql<number>`count(distinct ${users.id}) filter (where ${userProfiles.account_status} = 'active')`,
        suspendedUsers: sql<number>`count(distinct ${users.id}) filter (where ${userProfiles.account_status} = 'suspended')`,
        admins: sql<number>`count(distinct ${users.id}) filter (where ${userProfiles.role} in ('admin', 'super_admin'))`,
        projects: sql<number>`(select count(*) from ${projects})`,
        documents: sql<number>`(select count(*) from ${documents})`,
        chats: sql<number>`(select count(*) from ${chats})`,
        tabularReviews: sql<number>`(select count(*) from ${tabularReviews})`,
        aiCreditsUsed: sql<number>`coalesce(sum(${userProfiles.message_credits_used}), 0)`,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.user_id, users.id));

    const tierRows = await db
      .select({
        tier: userProfiles.tier,
        count: sql<number>`count(*)`,
      })
      .from(userProfiles)
      .groupBy(userProfiles.tier);

    const [financials] = await db
      .select({
        paidSubscriptions: sql<number>`count(*) filter (where ${subscriptions.status} = 'paid')`,
        pendingSubscriptions: sql<number>`count(*) filter (where ${subscriptions.status} = 'pending')`,
        activeSubscriptions: sql<number>`count(*) filter (where ${subscriptions.status} in ('paid', 'active'))`,
        totalRevenueCents: sql<number>`coalesce(sum(${subscriptions.amount_cents}) filter (where ${subscriptions.status} = 'paid'), 0)`,
        revenue30dCents: sql<number>`coalesce(sum(${subscriptions.amount_cents}) filter (where ${subscriptions.status} = 'paid' and ${subscriptions.created_at} >= now() - interval '30 days'), 0)`,
        payingUsers: sql<number>`count(distinct ${subscriptions.user_id}) filter (where ${subscriptions.status} = 'paid')`,
      })
      .from(subscriptions);

    const recentUsersQuery = db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.display_name,
        organisation: userProfiles.organisation,
        tier: userProfiles.tier,
        messageCreditsUsed: userProfiles.message_credits_used,
        role: userProfiles.role,
        accountStatus: userProfiles.account_status,
        createdAt: users.created_at,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.user_id, users.id))
      .$dynamic();
    const recentUsers = await (principal.role === "super_admin"
      ? recentUsersQuery
      : recentUsersQuery.where(sql`coalesce(${userProfiles.role}, 'user') <> 'super_admin'`)
    )
      .orderBy(desc(users.created_at))
      .limit(20);

    const adminQuery = db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.display_name,
        role: userProfiles.role,
        accountStatus: userProfiles.account_status,
        updatedAt: userProfiles.updated_at,
      })
      .from(userProfiles)
      .innerJoin(users, eq(users.id, userProfiles.user_id))
      .$dynamic();
    const admins = await (principal.role === "super_admin"
      ? adminQuery.where(sql`${userProfiles.role} in ('admin', 'super_admin')`)
      : adminQuery.where(sql`${userProfiles.role} = 'admin'`)
    ).orderBy(desc(userProfiles.updated_at));

    const auditLogs = await db
      .select({
        id: adminAuditLogs.id,
        actorEmail: adminAuditLogs.actor_email,
        action: adminAuditLogs.action,
        entityType: adminAuditLogs.entity_type,
        entityId: adminAuditLogs.entity_id,
        metadata: adminAuditLogs.metadata,
        createdAt: adminAuditLogs.created_at,
      })
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.created_at))
      .limit(25);

    return NextResponse.json({
      principal,
      counts: {
        users: numberValue(counts?.users),
        activeUsers: numberValue(counts?.activeUsers),
        suspendedUsers: numberValue(counts?.suspendedUsers),
        admins: numberValue(counts?.admins),
        projects: numberValue(counts?.projects),
        documents: numberValue(counts?.documents),
        chats: numberValue(counts?.chats),
        tabularReviews: numberValue(counts?.tabularReviews),
        aiCreditsUsed: numberValue(counts?.aiCreditsUsed),
      },
      tiers: tierRows.map((row) => ({
        tier: row.tier || "Free",
        count: numberValue(row.count),
      })),
      financials: {
        paidSubscriptions: numberValue(financials?.paidSubscriptions),
        pendingSubscriptions: numberValue(financials?.pendingSubscriptions),
        activeSubscriptions: numberValue(financials?.activeSubscriptions),
        totalRevenueCents: numberValue(financials?.totalRevenueCents),
        revenue30dCents: numberValue(financials?.revenue30dCents),
        payingUsers: numberValue(financials?.payingUsers),
        averageRevenuePerPaidUserCents:
          numberValue(financials?.payingUsers) > 0
            ? Math.round(numberValue(financials?.totalRevenueCents) / numberValue(financials?.payingUsers))
            : 0,
        currency: "SAR",
      },
      recentUsers,
      admins,
      auditLogs,
    });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/admin/overview error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
