import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { canAccessProject } from "@/lib/chatRoute";
import { errorToResponse } from "@/lib/http-error";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    if (!(await canAccessProject(id, authUser))) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }
    const rows = await db
      .select({
        id: chats.id,
        project_id: chats.project_id,
        user_id: chats.user_id,
        title: chats.title,
        created_at: chats.created_at,
      })
      .from(chats)
      .where(eq(chats.project_id, id))
      .orderBy(desc(chats.created_at));
    return NextResponse.json(rows);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/projects/[id]/chats error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
