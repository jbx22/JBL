import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { getBillingPlan } from "@/lib/billing/plans";
import { eq } from "drizzle-orm";

type MoyasarCallback = {
    status?: string;
    metadata?: {
        plan_id?: string;
        user_id?: string;
        tier?: string;
    };
};

export async function POST(req: NextRequest) {
    const payload = (await req.json().catch(() => null)) as MoyasarCallback | null;
    const plan = getBillingPlan(payload?.metadata?.plan_id);
    const userId = payload?.metadata?.user_id;

    if (payload?.status === "paid" && plan && userId) {
        await db
            .update(userProfiles)
            .set({
                tier: plan.tier,
                updated_at: new Date(),
            })
            .where(eq(userProfiles.user_id, userId));
    }

    return NextResponse.json({ ok: true });
}
