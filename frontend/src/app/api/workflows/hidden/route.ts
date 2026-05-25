import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { hiddenWorkflows } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const rows = await db.select({ workflow_id: hiddenWorkflows.workflow_id }).from(hiddenWorkflows).where(eq(hiddenWorkflows.user_id, userId));
    return NextResponse.json(rows.map((row) => row.workflow_id));
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/workflows/hidden error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const workflowId = String(body.workflow_id || "").trim();
    if (!workflowId) return NextResponse.json({ detail: "workflow_id is required" }, { status: 400 });
    await db.insert(hiddenWorkflows).values({ user_id: userId, workflow_id: workflowId }).onConflictDoNothing();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/workflows/hidden error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
