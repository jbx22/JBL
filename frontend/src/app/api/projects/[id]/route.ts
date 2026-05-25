import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { chats, documents, projects, projectSubfolders, tabularReviews } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

async function canAccessProject(projectId: string, userId: string, userEmail: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return null;
  const shared = Array.isArray(project.shared_with) ? project.shared_with : [];
  if (project.user_id !== userId && !shared.map(String).includes(userEmail)) return null;
  return project;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, userEmail } = await requireAuth();
    const { id } = await params;
    const project = await canAccessProject(id, userId, userEmail);
    if (!project) return NextResponse.json({ detail: "Project not found" }, { status: 404 });

    const [folders, docs] = await Promise.all([
      db.select().from(projectSubfolders).where(eq(projectSubfolders.project_id, id)).orderBy(projectSubfolders.created_at),
      db
        .select({
          id: documents.id,
          user_id: documents.user_id,
          project_id: documents.project_id,
          filename: documents.filename,
          file_type: documents.file_type,
          size_bytes: documents.size_bytes,
          page_count: documents.page_count,
          structure_tree: documents.structure_tree,
          status: documents.status,
          folder_id: documents.folder_id,
          current_version_id: documents.current_version_id,
          created_at: documents.created_at,
          updated_at: documents.updated_at,
          latest_version_number: sql<number | null>`(select max(version_number) from document_versions where document_id = ${documents.id})`,
        })
        .from(documents)
        .where(eq(documents.project_id, id))
        .orderBy(desc(documents.created_at)),
    ]);

    return NextResponse.json({
      ...project,
      is_owner: project.user_id === userId,
      shared_with: project.shared_with || [],
      folders,
      documents: docs.map((doc) => ({ ...doc, storage_path: null, pdf_storage_path: null })),
    });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/projects/[id] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!existing || existing.user_id !== userId) return NextResponse.json({ detail: "Project not found" }, { status: 404 });

    const values: Partial<typeof projects.$inferInsert> = { updated_at: new Date() };
    if (typeof body.name === "string" && body.name.trim()) values.name = body.name.trim();
    if ("cm_number" in body) values.cm_number = body.cm_number?.trim() || null;
    if (Array.isArray(body.shared_with)) values.shared_with = body.shared_with.map((email: unknown) => String(email).trim().toLowerCase()).filter(Boolean);

    const [project] = await db.update(projects).set(values).where(eq(projects.id, id)).returning();
    return NextResponse.json({ ...project, is_owner: true, shared_with: project.shared_with || [] });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("PATCH /api/projects/[id] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.user_id, userId)));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/projects/[id] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
