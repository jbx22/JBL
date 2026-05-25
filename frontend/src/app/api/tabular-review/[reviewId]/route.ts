import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { documents, tabularCells, tabularReviews } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

async function getAccessibleReview(reviewId: string, userId: string, userEmail: string) {
  const [review] = await db.select().from(tabularReviews).where(eq(tabularReviews.id, reviewId)).limit(1);
  if (!review) return null;
  const shared = Array.isArray(review.shared_with) ? review.shared_with.map(String) : [];
  if (review.user_id !== userId && !shared.includes(userEmail)) return null;
  return review;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { userId, userEmail } = await requireAuth();
    const { reviewId } = await params;
    const review = await getAccessibleReview(reviewId, userId, userEmail);
    if (!review) return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    const documentIds = Array.isArray(review.document_ids) ? review.document_ids.map(String) : [];
    const [cells, docs] = await Promise.all([
      db.select().from(tabularCells).where(eq(tabularCells.review_id, reviewId)),
      documentIds.length
        ? db.select().from(documents).where(inArray(documents.id, documentIds))
        : Promise.resolve([]),
    ]);
    return NextResponse.json({
      review: { ...review, is_owner: review.user_id === userId, shared_with: review.shared_with || [] },
      cells,
      documents: docs.map((doc) => ({ ...doc, storage_path: null, pdf_storage_path: null })),
    });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/tabular-review/[reviewId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { reviewId } = await params;
    const body = await req.json();
    const values: Partial<typeof tabularReviews.$inferInsert> = { updated_at: new Date() };
    if ("title" in body) values.title = String(body.title || "").trim() || null;
    if ("columns_config" in body) values.columns_config = body.columns_config ?? null;
    if ("document_ids" in body) values.document_ids = body.document_ids ?? [];
    if ("project_id" in body) values.project_id = body.project_id || null;
    if ("shared_with" in body && Array.isArray(body.shared_with)) values.shared_with = body.shared_with.map((email: unknown) => String(email).trim().toLowerCase()).filter(Boolean);
    const [review] = await db.update(tabularReviews).set(values).where(and(eq(tabularReviews.id, reviewId), eq(tabularReviews.user_id, userId))).returning();
    if (!review) return NextResponse.json({ detail: "Review not found" }, { status: 404 });
    return NextResponse.json({ ...review, is_owner: true, shared_with: review.shared_with || [] });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("PATCH /api/tabular-review/[reviewId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { reviewId } = await params;
    await db.delete(tabularReviews).where(and(eq(tabularReviews.id, reviewId), eq(tabularReviews.user_id, userId)));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/tabular-review/[reviewId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
