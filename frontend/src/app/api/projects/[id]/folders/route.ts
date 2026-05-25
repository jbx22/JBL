import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { projects, projectSubfolders } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ detail: "Folder name is required" }, { status: 400 });
    const [project] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, id), eq(projects.user_id, userId))).limit(1);
    if (!project) return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    const [folder] = await db
      .insert(projectSubfolders)
      .values({ project_id: id, user_id: userId, name, parent_folder_id: body.parent_folder_id || null })
      .returning();
    return NextResponse.json(folder);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/projects/[id]/folders error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
