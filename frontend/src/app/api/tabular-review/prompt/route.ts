import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { errorToResponse } from "@/lib/http-error";

function formatHint(format?: string): string {
  if (format === "bulleted_list") return "Return concise bullet points when values are present.";
  if (format === "yes_no") return "Return yes, no, or not found with brief reasoning.";
  if (format === "date") return "Return the relevant date in a clear legal-document format.";
  return "Return a concise extracted answer with brief reasoning.";
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ detail: "Title is required" }, { status: 400 });
    }
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
      : [];
    const tagText = tags.length ? ` Focus on: ${tags.join(", ")}.` : "";
    return NextResponse.json({
      prompt: `Extract the ${title} from the document.${tagText} ${formatHint(body.format)} If the information is not present, state "Not Found".`,
      source: "local",
    });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("POST /api/tabular-review/prompt error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
