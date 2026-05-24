import { NextRequest, NextResponse } from "next/server";
import { generateChatTitle } from "@/lib/chatRoute";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ detail: "message is required" }, { status: 400 });
  }
  return generateChatTitle(chatId, message);
}
