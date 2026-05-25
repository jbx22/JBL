import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { projects, projectSubfolders, documents, chats } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { errorToResponse } from "@/lib/http-error";

// GET /api/projects — list projects for current user
export async function GET(req: NextRequest) {
  try {
    const { userId, userEmail } = await requireAuth();

    const ownProjects = await db
      .select({
        id: projects.id,
        user_id: projects.user_id,
        name: projects.name,
        cm_number: projects.cm_number,
        shared_with: projects.shared_with,
        created_at: projects.created_at,
        updated_at: projects.updated_at,
        document_count: sql<number>`(select count(*) from ${documents} where ${documents.project_id} = ${projects.id})`,
        chat_count: sql<number>`(select count(*) from ${chats} where ${chats.project_id} = ${projects.id})`,
        review_count: sql<number>`(select count(*) from tabular_reviews where project_id = ${projects.id})`,
      })
      .from(projects)
      .where(eq(projects.user_id, userId))
      .orderBy(desc(projects.updated_at));

    // Also get shared projects where user's email is in shared_with
    let sharedProjects: typeof ownProjects = [];
    if (userEmail) {
      sharedProjects = await db
        .select({
          id: projects.id,
          user_id: projects.user_id,
          name: projects.name,
          cm_number: projects.cm_number,
          shared_with: projects.shared_with,
          created_at: projects.created_at,
          updated_at: projects.updated_at,
          document_count: sql<number>`(select count(*) from ${documents} where ${documents.project_id} = ${projects.id})`,
          chat_count: sql<number>`(select count(*) from ${chats} where ${chats.project_id} = ${projects.id})`,
          review_count: sql<number>`(select count(*) from tabular_reviews where project_id = ${projects.id})`,
        })
        .from(projects)
        .where(
          sql`${projects.user_id} <> ${userId} AND ${projects.shared_with}::jsonb @> ${JSON.stringify([userEmail])}::jsonb`
        )
        .orderBy(desc(projects.updated_at));
    }

    const allProjects = [...ownProjects, ...sharedProjects].map((p) => ({
      id: p.id,
      user_id: p.user_id,
      is_owner: p.user_id === userId,
      name: p.name,
      cm_number: p.cm_number,
      shared_with: p.shared_with || [],
      created_at: p.created_at,
      updated_at: p.updated_at,
      document_count: Number(p.document_count ?? 0),
      chat_count: Number(p.chat_count ?? 0),
      review_count: Number(p.review_count ?? 0),
    }));

    return NextResponse.json(allProjects);
  } catch (err: any) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects — create project
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ detail: "Project name is required" }, { status: 400 });
    }

    const [project] = await db
      .insert(projects)
      .values({
        user_id: userId,
        name,
        cm_number: body.cm_number?.trim() || null,
        visibility: body.visibility || "private",
      })
      .returning();

    return NextResponse.json(project);
  } catch (err: any) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
