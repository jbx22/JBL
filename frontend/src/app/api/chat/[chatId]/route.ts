import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { chats, chatMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/chat/[chatId] — get specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { chatId } = await params;

    const chat = await db
      .select({
        id: chats.id,
        project_id: chats.project_id,
        user_id: chats.user_id,
        title: chats.title,
        created_at: chats.created_at,
      })
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.user_id, userId)))
      .limit(1);

    if (!chat[0]) {
      return NextResponse.json({ detail: "Chat not found" }, { status: 404 });
    }

    const msgs = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chat_id, chatId))
      .orderBy(chatMessages.created_at);

    return NextResponse.json({ chat: chat[0], messages: msgs });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/chat/[chatId] — delete chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { chatId } = await params;

    await db.delete(chatMessages).where(eq(chatMessages.chat_id, chatId));
    await db.delete(chats).where(and(eq(chats.id, chatId), eq(chats.user_id, userId)));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
