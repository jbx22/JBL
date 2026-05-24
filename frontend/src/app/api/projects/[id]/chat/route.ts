import { NextRequest } from "next/server";
import { streamAssistantChat } from "@/lib/chatRoute";
import { errorToResponse } from "@/lib/http-error";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return await streamAssistantChat(req, id);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/projects/[id]/chat error:", err);
    return Response.json({ detail: "Internal server error" }, { status: 500 });
  }
}
