import { NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { tabularReviewChats } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reviewId: string; chatId: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { reviewId, chatId } = await params;
    await db
      .delete(tabularReviewChats)
      .where(
        and(
          eq(tabularReviewChats.id, chatId),
          eq(tabularReviewChats.review_id, reviewId),
          eq(tabularReviewChats.user_id, userId),
        ),
      );
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/tabular-review/[reviewId]/chats/[chatId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
