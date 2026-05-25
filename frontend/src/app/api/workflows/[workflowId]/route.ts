import { NextRequest, NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

async function getOwnedOrSystem(workflowId: string, userId: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, workflowId), or(eq(workflows.user_id, userId), eq(workflows.is_system, true))))
    .limit(1);
  return workflow ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { workflowId } = await params;
    const workflow = await getOwnedOrSystem(workflowId, userId);
    if (!workflow) return NextResponse.json({ detail: "Workflow not found" }, { status: 404 });
    return NextResponse.json({ ...workflow, is_owner: workflow.user_id === userId || workflow.is_system });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/workflows/[workflowId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { workflowId } = await params;
    const body = await req.json();
    const [workflow] = await db
      .update(workflows)
      .set({
        title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : undefined,
        prompt_md: "prompt_md" in body ? body.prompt_md ?? null : undefined,
        columns_config: "columns_config" in body ? body.columns_config ?? null : undefined,
        practice: "practice" in body ? body.practice ?? null : undefined,
      })
      .where(and(eq(workflows.id, workflowId), eq(workflows.user_id, userId), eq(workflows.is_system, false)))
      .returning();
    if (!workflow) return NextResponse.json({ detail: "Workflow not found" }, { status: 404 });
    return NextResponse.json({ ...workflow, is_owner: true });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("PATCH /api/workflows/[workflowId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ workflowId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { workflowId } = await params;
    await db.delete(workflows).where(and(eq(workflows.id, workflowId), eq(workflows.user_id, userId), eq(workflows.is_system, false)));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/workflows/[workflowId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
