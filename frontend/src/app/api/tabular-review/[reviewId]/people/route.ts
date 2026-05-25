import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { tabularReviews, users } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

export async function GET(_req: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    await requireAuth();
    const { reviewId } = await params;
    const [review] = await db.select().from(tabularReviews).where(eq(tabularReviews.id, reviewId)).limit(1);
    if (!review) return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    const [owner] = await db.select({ user_id: users.id, email: users.email, display_name: users.display_name }).from(users).where(eq(users.id, review.user_id)).limit(1);
    const emails = Array.isArray(review.shared_with) ? review.shared_with.map(String) : [];
    const members = emails.length ? await db.select({ email: users.email, display_name: users.display_name }).from(users).where(inArray(users.email, emails)) : [];
    return NextResponse.json({ owner: owner ?? { user_id: review.user_id, email: null, display_name: null }, members });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/tabular-review/[reviewId]/people error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
