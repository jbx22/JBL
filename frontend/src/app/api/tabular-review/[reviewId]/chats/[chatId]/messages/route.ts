import { NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { tabularReviewChatMessages, tabularReviewChats } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";
import { and, asc, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reviewId: string; chatId: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { reviewId, chatId } = await params;
    const [chat] = await db
      .select({ id: tabularReviewChats.id })
      .from(tabularReviewChats)
      .where(
        and(
          eq(tabularReviewChats.id, chatId),
          eq(tabularReviewChats.review_id, reviewId),
          eq(tabularReviewChats.user_id, userId),
        ),
      )
      .limit(1);
    if (!chat) {
      return NextResponse.json({ detail: "Chat not found" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(tabularReviewChatMessages)
      .where(eq(tabularReviewChatMessages.chat_id, chatId))
      .orderBy(asc(tabularReviewChatMessages.created_at));
    return NextResponse.json(messages);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/tabular-review/[reviewId]/chats/[chatId]/messages error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
