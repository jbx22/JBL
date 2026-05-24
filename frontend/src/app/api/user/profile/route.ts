import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { userProfiles, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const MONTHLY_CREDIT_LIMIT = 999999;
const DEFAULT_TABULAR_MODEL = "deepseek-v4-flash";

// GET /api/user/profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();

    let profile = await db
      .select({
        display_name: userProfiles.display_name,
        organisation: userProfiles.organisation,
        message_credits_used: userProfiles.message_credits_used,
        credits_reset_date: userProfiles.credits_reset_date,
        tier: userProfiles.tier,
        tabular_model: userProfiles.tabular_model,
      })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, userId))
      .limit(1);

    // Auto-create profile if missing
    if (profile.length === 0) {
      await db.insert(userProfiles).values({
        user_id: userId,
        tabular_model: DEFAULT_TABULAR_MODEL,
      });
      profile = await db
        .select({
          display_name: userProfiles.display_name,
          organisation: userProfiles.organisation,
          message_credits_used: userProfiles.message_credits_used,
          credits_reset_date: userProfiles.credits_reset_date,
          tier: userProfiles.tier,
          tabular_model: userProfiles.tabular_model,
        })
        .from(userProfiles)
        .where(eq(userProfiles.user_id, userId))
        .limit(1);
    }

    const row = profile[0];
    if (!row) {
      return NextResponse.json({ detail: "Profile not found" }, { status: 500 });
    }

    const creditsUsed = row.message_credits_used ?? 0;
    return NextResponse.json({
      displayName: row.display_name,
      organisation: row.organisation,
      messageCreditsUsed: creditsUsed,
      creditsResetDate: row.credits_reset_date,
      creditsRemaining: Math.max(MONTHLY_CREDIT_LIMIT - creditsUsed, 0),
      tier: row.tier || "Free",
      tabularModel: row.tabular_model || DEFAULT_TABULAR_MODEL,
    });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/user/profile
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();

    const update: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if ("displayName" in body) {
      update.display_name = body.displayName?.trim() || null;
    }
    if ("organisation" in body) {
      update.organisation = body.organisation?.trim() || null;
    }
    if ("tabularModel" in body) {
      update.tabular_model = body.tabularModel;
    }

    // Ensure profile row exists
    const existing = await db
      .select({ user_id: userProfiles.user_id })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, userId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userProfiles).values({
        user_id: userId,
        tabular_model: DEFAULT_TABULAR_MODEL,
        ...update,
      });
    } else {
      await db
        .update(userProfiles)
        .set(update)
        .where(eq(userProfiles.user_id, userId));
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
