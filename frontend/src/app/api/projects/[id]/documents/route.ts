import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { checkProjectAccess } from "@/app/api/access";
import { uploadDocumentForUser } from "@/app/api/document-upload";
import { errorToResponse } from "@/lib/http-error";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, userEmail } = await requireAuth();
    const { id: projectId } = await params;
    const access = await checkProjectAccess(projectId, userId, userEmail);
    if (!access.ok) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }
    return await uploadDocumentForUser(req, userId, projectId);
  } catch (err) {
    const authError = errorToResponse(err);
    if (authError) return authError;
    console.error("POST /api/projects/[id]/documents error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
