import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { documents, projects } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

async function requireOwner(projectId: string, userId: string) {
  const [project] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, projectId), eq(projects.user_id, userId))).limit(1);
  return !!project;
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id, documentId } = await params;
    if (!(await requireOwner(id, userId))) return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    const [doc] = await db.update(documents).set({ project_id: id, updated_at: new Date() }).where(and(eq(documents.id, documentId), eq(documents.user_id, userId))).returning();
    if (!doc) return NextResponse.json({ detail: "Document not found" }, { status: 404 });
    return NextResponse.json({ ...doc, storage_path: null, pdf_storage_path: null });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/projects/[id]/documents/[documentId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id, documentId } = await params;
    if (!(await requireOwner(id, userId))) return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    const body = await req.json();
    const filename = String(body.filename || "").trim();
    if (!filename) return NextResponse.json({ detail: "Filename is required" }, { status: 400 });
    const [doc] = await db.update(documents).set({ filename, updated_at: new Date() }).where(and(eq(documents.id, documentId), eq(documents.project_id, id))).returning();
    if (!doc) return NextResponse.json({ detail: "Document not found" }, { status: 404 });
    return NextResponse.json({ ...doc, storage_path: null, pdf_storage_path: null });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("PATCH /api/projects/[id]/documents/[documentId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
