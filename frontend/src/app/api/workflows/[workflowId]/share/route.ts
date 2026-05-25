import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { workflowShares, workflows } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";
import { and, eq } from "drizzle-orm";

function normalizeEmails(value: unknown): string[] {
  const emails = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return [
    ...new Set(
      emails
        .map((email) => String(email).trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    ),
  ];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  try {
    const { userId, userEmail } = await requireAuth();
    const { workflowId } = await params;
    const body = await req.json();
    const emails = normalizeEmails(body.emails);
    if (!emails.length) {
      return NextResponse.json({ detail: "At least one valid email is required" }, { status: 400 });
    }
    if (emails.includes(userEmail.trim().toLowerCase())) {
      return NextResponse.json({ detail: "You cannot share a workflow with yourself." }, { status: 400 });
    }

    const [workflow] = await db
      .select({ id: workflows.id })
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.user_id, userId), eq(workflows.is_system, false)))
      .limit(1);
    if (!workflow) {
      return NextResponse.json({ detail: "Workflow not found or not editable" }, { status: 404 });
    }

    await db
      .insert(workflowShares)
      .values(
        emails.map((email) => ({
          workflow_id: workflowId,
          shared_by_user_id: userId,
          shared_with_email: email,
          allow_edit: Boolean(body.allow_edit),
        })),
      )
      .onConflictDoUpdate({
        target: [workflowShares.workflow_id, workflowShares.shared_with_email],
        set: {
          shared_by_user_id: userId,
          allow_edit: Boolean(body.allow_edit),
        },
      });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/workflows/[workflowId]/share error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
