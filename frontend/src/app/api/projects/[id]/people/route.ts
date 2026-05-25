import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    const [owner] = await db.select({ user_id: users.id, email: users.email, display_name: users.display_name }).from(users).where(eq(users.id, project.user_id)).limit(1);
    const emails = Array.isArray(project.shared_with) ? project.shared_with.map(String) : [];
    const members = emails.length ? await db.select({ email: users.email, display_name: users.display_name }).from(users).where(inArray(users.email, emails)) : [];
    return NextResponse.json({ owner: owner ?? { user_id: project.user_id, email: null, display_name: null }, members });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("GET /api/projects/[id]/people error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
