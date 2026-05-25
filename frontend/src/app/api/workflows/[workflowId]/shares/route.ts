import { NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { workflowShares, workflows } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";
import { and, asc, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { workflowId } = await params;
    const [workflow] = await db
      .select({ id: workflows.id })
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.user_id, userId), eq(workflows.is_system, false)))
      .limit(1);
    if (!workflow) {
      return NextResponse.json({ detail: "Workflow not found or not editable" }, { status: 404 });
    }

    const shares = await db
      .select({
        id: workflowShares.id,
        shared_with_email: workflowShares.shared_with_email,
        allow_edit: workflowShares.allow_edit,
        created_at: workflowShares.created_at,
      })
      .from(workflowShares)
      .where(eq(workflowShares.workflow_id, workflowId))
      .orderBy(asc(workflowShares.created_at));
    return NextResponse.json(shares);
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/workflows/[workflowId]/shares error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
