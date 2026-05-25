import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { documents, projects, projectSubfolders } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

async function requireOwner(projectId: string, userId: string) {
  const [project] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, projectId), eq(projects.user_id, userId))).limit(1);
  return !!project;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; folderId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id, folderId } = await params;
    if (!(await requireOwner(id, userId))) return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    const body = await req.json();
    const values: Partial<typeof projectSubfolders.$inferInsert> = { updated_at: new Date() };
    if (typeof body.name === "string" && body.name.trim()) values.name = body.name.trim();
    if ("parent_folder_id" in body) values.parent_folder_id = body.parent_folder_id || null;
    const [folder] = await db.update(projectSubfolders).set(values).where(and(eq(projectSubfolders.id, folderId), eq(projectSubfolders.project_id, id))).returning();
    if (!folder) return NextResponse.json({ detail: "Folder not found" }, { status: 404 });
    return NextResponse.json(folder);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("PATCH /api/projects/[id]/folders/[folderId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; folderId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id, folderId } = await params;
    if (!(await requireOwner(id, userId))) return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    await db.update(documents).set({ folder_id: null, updated_at: new Date() }).where(and(eq(documents.project_id, id), eq(documents.folder_id, folderId)));
    await db.delete(projectSubfolders).where(and(eq(projectSubfolders.id, folderId), eq(projectSubfolders.project_id, id)));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/projects/[id]/folders/[folderId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
