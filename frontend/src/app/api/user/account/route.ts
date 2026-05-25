import { NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth-helpers";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { errorToResponse } from "@/lib/http-error";
import { eq } from "drizzle-orm";

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    await db
      .update(userProfiles)
      .set({
        account_status: "deleted",
        updated_at: new Date(),
      })
      .where(eq(userProfiles.user_id, userId));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const response = errorToResponse(err);
    if (response) return response;
    console.error("DELETE /api/user/account error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
