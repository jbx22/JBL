import { NextResponse } from "next/server";
import { Resend } from "resend";

type SupportPayload = {
  type?: string;
  subject?: string;
  message?: string;
  email?: string;
  link?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as SupportPayload | null;

  if (!payload?.type || !payload?.subject || !payload?.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_TO_EMAIL || process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "JBL BIZ LAW <onboarding@resend.dev>";

  if (resendKey && to) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from,
      to,
      subject: `JBL Support: ${payload.subject}`,
      replyTo: payload.email ?? undefined,
      text: [
        `Type: ${payload.type}`,
        `Subject: ${payload.subject}`,
        `Email: ${payload.email ?? "Not provided"}`,
        `Link: ${payload.link ?? "Not provided"}`,
        "",
        payload.message,
      ].join("\n"),
    });
  }

  return NextResponse.json({ ok: true });
}
