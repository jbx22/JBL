import { NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { workflowShares, workflows } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workflowId: string; shareId: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { workflowId, shareId } = await params;
    const [workflow] = await db
      .select({ id: workflows.id })
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.user_id, userId)))
      .limit(1);
    if (!workflow) {
      return NextResponse.json({ detail: "Workflow not found" }, { status: 404 });
    }

    await db
      .delete(workflowShares)
      .where(and(eq(workflowShares.id, shareId), eq(workflowShares.workflow_id, workflowId)));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/workflows/[workflowId]/shares/[shareId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
