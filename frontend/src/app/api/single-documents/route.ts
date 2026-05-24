import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import {
  documents,
  documentVersions,
  projects,
  projectSubfolders,
  users,
} from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { ensureDocAccess } from "@/app/api/access";

// GET /api/single-documents — list user's documents
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const docs = await db
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
      })
      .from(documents)
      .where(
        and(
          eq(documents.user_id, userId),
          sql`${documents.project_id} IS NULL`
        )
      )
      .orderBy(desc(documents.created_at));

    return NextResponse.json(docs);
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("GET /api/single-documents error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/single-documents — upload document
// NOTE: This is a stub - full implementation requires R2 integration
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { detail: "Document upload not yet ported to Next.js API" },
    { status: 501 }
  );
}

// DELETE /api/single-documents/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id: documentId } = await params;
    if (!documentId) {
      return NextResponse.json({ detail: "Document ID required" }, { status: 400 });
    }

    const doc = await db
      .select({
        id: documents.id,
        user_id: documents.user_id,
        project_id: documents.project_id,
      })
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc[0]) {
      return NextResponse.json({ detail: "Document not found" }, { status: 404 });
    }

    const access = await ensureDocAccess(doc[0], userId, null);
    if (!access.ok) {
      return NextResponse.json({ detail: "Access denied" }, { status: 403 });
    }

    await db.delete(documents).where(eq(documents.id, documentId));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("DELETE /api/single-documents error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
