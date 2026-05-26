import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { listAccessibleProjectIds } from "@/app/api/access";
import { db } from "@/db";
import { tabularReviews } from "@/db/schema";
import { and, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { errorToResponse } from "@/lib/http-error";

const reviewFields = {
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
};

// GET /api/tabular-review
export async function GET(req: NextRequest) {
  try {
    const { userId, userEmail } = await requireAuth();
    const projectId = req.nextUrl.searchParams.get("project_id")?.trim() || null;
    const accessibleProjectIds = await listAccessibleProjectIds(userId, userEmail);

    if (projectId && !accessibleProjectIds.includes(projectId)) {
      return NextResponse.json([]);
    }

    const ownReviews = await db
      .select(reviewFields)
      .from(tabularReviews)
      .where(
        projectId
          ? and(eq(tabularReviews.user_id, userId), eq(tabularReviews.project_id, projectId))
          : eq(tabularReviews.user_id, userId)
      )
      .orderBy(desc(tabularReviews.updated_at));

    const projectReviews = accessibleProjectIds.length
      ? await db
          .select(reviewFields)
          .from(tabularReviews)
          .where(
            projectId
              ? eq(tabularReviews.project_id, projectId)
              : inArray(tabularReviews.project_id, accessibleProjectIds)
          )
          .orderBy(desc(tabularReviews.updated_at))
      : [];

    const directShareCandidates = projectId
      ? []
      : await db
          .select(reviewFields)
          .from(tabularReviews)
          .where(and(ne(tabularReviews.user_id, userId), isNull(tabularReviews.project_id)))
          .orderBy(desc(tabularReviews.updated_at));

    const email = (userEmail ?? "").toLowerCase();
    const directSharedReviews = email
      ? directShareCandidates.filter((review) => {
          const sharedWith = Array.isArray(review.shared_with) ? review.shared_with : [];
          return sharedWith.some((sharedEmail) => {
            return String(sharedEmail ?? "").toLowerCase() === email;
          });
        })
      : [];

    const reviewsById = new Map<string, (typeof ownReviews)[number]>();
    for (const review of [...ownReviews, ...projectReviews, ...directSharedReviews]) {
      reviewsById.set(review.id, review);
    }

    const reviews = [...reviewsById.values()]
      .sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .map((review) => ({
        ...review,
        shared_with: Array.isArray(review.shared_with) ? review.shared_with : [],
        is_owner: review.user_id === userId,
      }));

    return NextResponse.json(reviews);
  } catch (err: unknown) {
    const response = errorToResponse(err);
    if (response) return response;
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
  } catch (err: unknown) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/tabular-review error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
