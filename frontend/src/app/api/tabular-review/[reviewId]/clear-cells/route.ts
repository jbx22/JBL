import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { tabularCells, tabularReviews } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { reviewId } = await params;
    const [review] = await db.select({ id: tabularReviews.id }).from(tabularReviews).where(and(eq(tabularReviews.id, reviewId), eq(tabularReviews.user_id, userId))).limit(1);
    if (!review) return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    const body = await req.json();
    const ids = Array.isArray(body.document_ids) ? body.document_ids.map(String) : [];
    if (ids.length) {
      await db.update(tabularCells).set({ content: null, status: "pending" }).where(and(eq(tabularCells.review_id, reviewId), inArray(tabularCells.document_id, ids)));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/tabular-review/[reviewId]/clear-cells error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
