import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { chats, chatMessages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/chat — list user's chats
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const chatList = await db
      .select({
        id: chats.id,
        project_id: chats.project_id,
        user_id: chats.user_id,
        title: chats.title,
        created_at: chats.created_at,
      })
      .from(chats)
      .where(eq(chats.user_id, userId))
      .orderBy(desc(chats.created_at));

    return NextResponse.json(chatList);
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("GET /api/chat error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/chat — send a message (stub — requires LLM integration)
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { detail: "Chat AI streaming not yet ported to Next.js API routes. Please run the Express backend for chat features." },
    { status: 501 }
  );
}

// POST /api/chat/create — create a new chat
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();

    const [chat] = await db
      .insert(chats)
      .values({
        user_id: userId,
        title: body.title || "New Chat",
        project_id: body.project_id || null,
      })
      .returning();

    return NextResponse.json(chat);
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("PUT /api/chat error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// GET /api/chat/:chatId — get chat with messages
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const url = new URL(req.url);
    const chatId = url.pathname.split("/").pop();
    if (!chatId) {
      return NextResponse.json({ detail: "Chat ID required" }, { status: 400 });
    }

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

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chat_id, chatId))
      .orderBy(chatMessages.created_at);

    return NextResponse.json({ chat: chat[0], messages });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
