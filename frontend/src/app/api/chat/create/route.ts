import { NextRequest } from "next/server";
import { createChat } from "@/lib/chatRoute";
import { errorToResponse } from "@/lib/http-error";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.project_id === "string" ? body.project_id : null;
    return await createChat(projectId);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/chat/create error:", err);
    return Response.json({ detail: "Internal server error" }, { status: 500 });
  }
}
