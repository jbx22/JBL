import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { hiddenWorkflows } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

export async function DELETE(_req: Request, { params }: { params: Promise<{ workflowId: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { workflowId } = await params;
    await db.delete(hiddenWorkflows).where(and(eq(hiddenWorkflows.user_id, userId), eq(hiddenWorkflows.workflow_id, workflowId)));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/workflows/hidden/[workflowId] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
