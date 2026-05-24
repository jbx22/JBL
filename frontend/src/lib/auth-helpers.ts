import { auth } from "@/lib/auth";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw Response.json({ detail: "Unauthorized" }, { status: 401 });
  }
  return {
    userId: session.user.id,
    userEmail: session.user.email || "",
  };
}
