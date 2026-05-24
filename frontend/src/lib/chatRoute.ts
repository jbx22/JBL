import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chats, chatMessages, projects, userProfiles } from "@/db/schema";
import { requireAuth, type AuthUser } from "@/app/api/auth-helpers";
import {
  buildDocContext,
  buildMessages,
  buildProjectDocContext,
  buildWorkflowStore,
  enrichWithPriorEvents,
  extractAnnotations,
  runLLMStream,
  type ChatMessage,
} from "@/lib/chatTools";
import { createServerSupabase } from "@/lib/supabase";
import { getUserApiKeys, getUserModelSettings } from "@/lib/userSettings";
import { completeText, DEFAULT_MAIN_MODEL, resolveModel } from "@/lib/llm";

type AccessibleChat = {
  id: string;
  title: string | null;
  user_id: string;
  project_id: string | null;
};

function errorResponse(err: unknown, context: string) {
  if (err instanceof Response) return err;
  if (err && typeof err === "object" && "status" in err && "message" in err) {
    const status = Number((err as { status?: number }).status) || 500;
    return NextResponse.json({ detail: String((err as { message?: unknown }).message) }, { status });
  }
  console.error(context, err);
  return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (typeof row.role !== "string") return null;
    messages.push({
      role: row.role,
      content: typeof row.content === "string" ? row.content : "",
      files: Array.isArray(row.files)
        ? (row.files as { filename: string; document_id?: string }[])
        : undefined,
      workflow:
        row.workflow && typeof row.workflow === "object"
          ? (row.workflow as { id: string; title: string })
          : undefined,
    });
  }
  return messages;
}

export async function canAccessProject(
  projectId: string,
  authUser: AuthUser,
): Promise<boolean> {
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
  if (!project) return false;
  if (project.user_id === authUser.userId) return true;
  const shared = Array.isArray(project.shared_with) ? project.shared_with : [];
  return shared.map(String).map((email) => email.toLowerCase()).includes(authUser.userEmail);
}

export async function getAccessibleChat(
  chatId: string,
  authUser: AuthUser,
): Promise<AccessibleChat | null> {
  const rows = await db
    .select({
      id: chats.id,
      title: chats.title,
      user_id: chats.user_id,
      project_id: chats.project_id,
    })
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);
  const chat = rows[0];
  if (!chat) return null;
  if (chat.user_id === authUser.userId) return chat;
  if (chat.project_id && (await canAccessProject(chat.project_id, authUser))) return chat;
  return null;
}

export async function listChats() {
  try {
    const authUser = await requireAuth();
    const rows = await db
      .select({
        id: chats.id,
        project_id: chats.project_id,
        user_id: chats.user_id,
        title: chats.title,
        created_at: chats.created_at,
      })
      .from(chats)
      .where(eq(chats.user_id, authUser.userId))
      .orderBy(desc(chats.created_at));
    return NextResponse.json(rows);
  } catch (err) {
    return errorResponse(err, "GET /api/chat error:");
  }
}

export async function createChat(projectId?: string | null) {
  const authUser = await requireAuth();
  const resolvedProjectId = projectId || null;
  if (resolvedProjectId && !(await canAccessProject(resolvedProjectId, authUser))) {
    return NextResponse.json({ detail: "Project not found" }, { status: 404 });
  }
  const [chat] = await db
    .insert(chats)
    .values({
      user_id: authUser.userId,
      project_id: resolvedProjectId,
      title: null,
    })
    .returning({ id: chats.id });
  return NextResponse.json({ id: chat.id });
}

export async function streamAssistantChat(req: Request, projectId?: string) {
  const authUser = await requireAuth();
  const body = (await req.json()) as Record<string, unknown>;
  const messages = parseMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ detail: "messages must be a non-empty array" }, { status: 400 });
  }

  const requestedChatId =
    typeof body.chat_id === "string" && body.chat_id.trim() ? body.chat_id.trim() : null;
  const requestedProjectId =
    projectId || (typeof body.project_id === "string" && body.project_id.trim()
      ? body.project_id.trim()
      : null);
  const model = resolveModel(typeof body.model === "string" ? body.model : undefined, DEFAULT_MAIN_MODEL);

  let chatId = requestedChatId;
  let chatTitle: string | null = null;
  let resolvedProjectId = requestedProjectId;

  if (chatId) {
    const existing = await getAccessibleChat(chatId, authUser);
    if (!existing) return NextResponse.json({ detail: "Chat not found" }, { status: 404 });
    if (requestedProjectId && requestedProjectId !== existing.project_id) {
      return NextResponse.json({ detail: "project_id does not match chat" }, { status: 400 });
    }
    resolvedProjectId = existing.project_id;
    chatTitle = existing.title;
  } else {
    if (resolvedProjectId && !(await canAccessProject(resolvedProjectId, authUser))) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }
    const [created] = await db
      .insert(chats)
      .values({ user_id: authUser.userId, project_id: resolvedProjectId, title: null })
      .returning({ id: chats.id, title: chats.title });
    chatId = created.id;
    chatTitle = created.title;
  }

  await db
    .update(userProfiles)
    .set({ message_credits_used: sql`${userProfiles.message_credits_used} + 1`, updated_at: new Date() })
    .where(eq(userProfiles.user_id, authUser.userId));

  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  if (lastUser) {
    await db.insert(chatMessages).values({
      chat_id: chatId,
      role: "user",
      content: lastUser.content,
      files: lastUser.files ?? null,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (line: string) => controller.enqueue(encoder.encode(line));
      try {
        write(`data: ${JSON.stringify({ type: "chat_id", chatId })}\n\n`);
        const supabase = createServerSupabase();
        const workflowStore = await buildWorkflowStore(authUser.userId, authUser.userEmail, supabase);
        const apiKeys = await getUserApiKeys(authUser.userId, supabase);

        const { docIndex, docStore } = resolvedProjectId
          ? await buildProjectDocContext(resolvedProjectId, authUser.userId, supabase)
          : await buildDocContext(messages, authUser.userId, supabase, chatId);
        const docAvailability = Object.entries(docIndex).map(([doc_id, info]) => ({
          doc_id,
          filename: info.filename,
        }));
        const enrichedMessages = await enrichWithPriorEvents(messages, chatId, supabase, docIndex);
        const apiMessages = buildMessages(enrichedMessages, docAvailability);

        const { fullText, events } = await runLLMStream({
          apiMessages,
          docStore,
          docIndex,
          userId: authUser.userId,
          db: supabase,
          write,
          workflowStore,
          model,
          apiKeys,
          projectId: resolvedProjectId ?? undefined,
        });

        const annotations = extractAnnotations(fullText, docIndex, events);
        await db.insert(chatMessages).values({
          chat_id: chatId,
          role: "assistant",
          content: events.length ? events : null,
          annotations: annotations.length ? annotations : null,
        });

        if (!chatTitle && lastUser?.content) {
          await db
            .update(chats)
            .set({ title: lastUser.content.slice(0, 120) })
            .where(eq(chats.id, chatId));
        }
      } catch (err) {
        console.error("POST /api/chat stream error:", err);
        write(`data: ${JSON.stringify({ type: "error", message: "Stream error" })}\n\n`);
        write("data: [DONE]\n\n");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function generateChatTitle(chatId: string, message: string) {
  try {
    const authUser = await requireAuth();
    const chat = await getAccessibleChat(chatId, authUser);
    if (!chat) return NextResponse.json({ detail: "Chat not found" }, { status: 404 });
    const supabase = createServerSupabase();
    const { title_model, api_keys } = await getUserModelSettings(authUser.userId, supabase);
    const titleText = await completeText({
      model: title_model,
      user: `Generate a concise title of 3 to 6 words for this legal assistant chat. Return only the title.\n\nMessage: ${message.slice(0, 500)}`,
      maxTokens: 64,
      apiKeys: api_keys,
    });
    const title = titleText.trim() || message.slice(0, 60);
    await db.update(chats).set({ title }).where(eq(chats.id, chatId));
    return NextResponse.json({ title });
  } catch (err) {
    return errorResponse(err, "POST /api/chat/[chatId]/generate-title error:");
  }
}

export async function renameChat(chatId: string, title: string) {
  const authUser = await requireAuth();
  const chat = await getAccessibleChat(chatId, authUser);
  if (!chat || chat.user_id !== authUser.userId) {
    return NextResponse.json({ detail: "Chat not found" }, { status: 404 });
  }
  await db.update(chats).set({ title }).where(and(eq(chats.id, chatId), eq(chats.user_id, authUser.userId)));
  return NextResponse.json({ id: chatId, title });
}
