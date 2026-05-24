/**
 * Project / document access helpers — ported from backend/src/lib/access.ts.
 * Uses Drizzle ORM instead of Supabase client.
 */
import { db } from "@/db";
import { projects, documents, tabularReviews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type ProjectAccess =
  | {
      ok: true;
      isOwner: boolean;
      project: {
        id: string;
        user_id: string;
        shared_with: string[] | null;
      };
    }
  | { ok: false };

export async function checkProjectAccess(
  projectId: string,
  userId: string,
  userEmail: string | null | undefined,
): Promise<ProjectAccess> {
  const rows = await db
    .select({
      id: projects.id,
      user_id: projects.user_id,
      shared_with: projects.shared_with,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  const project = rows[0];
  if (!project) return { ok: false };

  const proj = {
    id: project.id,
    user_id: project.user_id,
    shared_with: project.shared_with as string[] | null,
  };

  if (proj.user_id === userId) {
    return { ok: true, isOwner: true, project: proj };
  }

  const sharedWith = Array.isArray(proj.shared_with) ? proj.shared_with : [];
  const email = (userEmail ?? "").toLowerCase();
  if (email && sharedWith.some((e: string) => (e ?? "").toLowerCase() === email)) {
    return { ok: true, isOwner: false, project: proj };
  }

  return { ok: false };
}

export async function ensureDocAccess(
  doc: { user_id: string; project_id: string | null },
  userId: string,
  userEmail: string | null | undefined,
): Promise<{ ok: true; isOwner: boolean } | { ok: false }> {
  if (doc.user_id === userId) return { ok: true, isOwner: true };
  if (!doc.project_id) return { ok: false };
  const access = await checkProjectAccess(doc.project_id, userId, userEmail);
  if (access.ok) return { ok: true, isOwner: false };
  return { ok: false };
}

export async function ensureReviewAccess(
  review: {
    user_id: string;
    project_id: string | null;
    shared_with?: string[] | null;
  },
  userId: string,
  userEmail: string | null | undefined,
): Promise<{ ok: true; isOwner: boolean } | { ok: false }> {
  if (review.user_id === userId) return { ok: true, isOwner: true };
  const email = (userEmail ?? "").toLowerCase();
  if (email && Array.isArray(review.shared_with)) {
    if (review.shared_with.some((e: string) => (e ?? "").toLowerCase() === email)) {
      return { ok: true, isOwner: false };
    }
  }
  if (!review.project_id) return { ok: false };
  const access = await checkProjectAccess(review.project_id, userId, userEmail);
  if (access.ok) return { ok: true, isOwner: false };
  return { ok: false };
}

export async function listAccessibleProjectIds(
  userId: string,
  userEmail: string | null | undefined,
): Promise<string[]> {
  const ownRows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.user_id, userId));

  const ids = new Set<string>();
  for (const p of ownRows) ids.add(p.id);

  if (userEmail) {
    const sharedRows = await db
      .select({ id: projects.id, shared_with: projects.shared_with })
      .from(projects)
      .where(sql`${projects.user_id} <> ${userId}`);

    const email = userEmail.toLowerCase();
    for (const p of sharedRows) {
      const sw = (p.shared_with as string[] | null) ?? [];
      if (sw.some((e: string) => (e ?? "").toLowerCase() === email)) {
        ids.add(p.id);
      }
    }
  }

  return [...ids];
}

export async function filterAccessibleDocumentIds(
  documentIds: string[],
  userId: string,
  userEmail: string | null | undefined,
): Promise<string[]> {
  if (documentIds.length === 0) return [];

  const docs = await db
    .select({
      id: documents.id,
      user_id: documents.user_id,
      project_id: documents.project_id,
    })
    .from(documents)
    .where(sql`${documents.id} = ANY(${documentIds})`);

  if (docs.length === 0) return [];

  const accessibleProjectIds = new Set(
    await listAccessibleProjectIds(userId, userEmail),
  );

  return docs
    .filter(
      (doc) =>
        doc.user_id === userId ||
        (doc.project_id && accessibleProjectIds.has(doc.project_id)),
    )
    .map((doc) => doc.id);
}
