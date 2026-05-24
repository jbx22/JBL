import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { tabularReviews, tabularCells, documents } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

// GET /api/tabular-review
export async function GET(req: NextRequest) {
  try {
    const { userId, userEmail } = await requireAuth();

    const ownReviews = await db
      .select({
        id: tabularReviews.id,
        project_id: tabularReviews.project_id,
        user_id: tabularReviews.user_id,
        title: tabularReviews.title,
        columns_config: tabularReviews.columns_config,
        document_ids: tabularReviews.document_ids,
        workflow_id: tabularReviews.workflow_id,
        practice: tabularReviews.practice,
        shared_with: tabularReviews.shared_with,
        created_at: tabularReviews.created_at,
        updated_at: tabularReviews.updated_at,
      })
      .from(tabularReviews)
      .where(eq(tabularReviews.user_id, userId))
      .orderBy(desc(tabularReviews.updated_at));

    return NextResponse.json(
      ownReviews.map((r) => ({
        ...r,
        is_owner: true,
      }))
    );
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("GET /api/tabular-review error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tabular-review — create review (stub for full implementation)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ detail: "Title is required" }, { status: 400 });
    }

    const [review] = await db
      .insert(tabularReviews)
      .values({
        user_id: userId,
        title,
        project_id: body.project_id || null,
        columns_config: body.columns_config || null,
        document_ids: body.document_ids || null,
        workflow_id: body.workflow_id || null,
        practice: body.practice || null,
      })
      .returning();

    return NextResponse.json(review);
  } catch (err: any) {
    if (err instanceof Response) throw err;
    console.error("POST /api/tabular-review error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
