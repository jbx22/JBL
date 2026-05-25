import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { workflows, hiddenWorkflows, workflowShares } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { errorToResponse } from "@/lib/http-error";

// GET /api/workflows
export async function GET(req: NextRequest) {
  try {
    const { userId, userEmail } = await requireAuth();

    // Get user's own workflows and system workflows
    const result = await db
      .select({
        id: workflows.id,
        user_id: workflows.user_id,
        title: workflows.title,
        type: workflows.type,
        prompt_md: workflows.prompt_md,
        columns_config: workflows.columns_config,
        practice: workflows.practice,
        is_system: workflows.is_system,
        created_at: workflows.created_at,
      })
      .from(workflows)
      .where(
        or(
          eq(workflows.user_id, userId),
          eq(workflows.is_system, true)
        )
      )
      .orderBy(
        desc(workflows.is_system),
        desc(workflows.created_at)
      );

    return NextResponse.json(
      result.map((w) => ({
        id: w.id,
        user_id: w.user_id,
        title: w.title,
        type: w.type,
        prompt_md: w.prompt_md,
        columns_config: w.columns_config,
        practice: w.practice,
        is_system: w.is_system,
        is_owner: w.user_id === userId || w.is_system,
        created_at: w.created_at,
      }))
    );
  } catch (err: any) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/workflows error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/workflows — create workflow
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ detail: "Title is required" }, { status: 400 });
    }

    const [workflow] = await db
      .insert(workflows)
      .values({
        user_id: userId,
        title,
        type: body.type || "assistant",
        prompt_md: body.prompt_md || null,
        columns_config: body.columns_config || null,
        practice: body.practice || null,
        is_system: false,
      })
      .returning();

    return NextResponse.json(workflow);
  } catch (err: any) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/workflows error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
