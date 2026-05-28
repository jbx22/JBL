import { NextResponse } from "next/server";
import { Resend } from "resend";

type ContactPayload = {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    topic?: string;
    message?: string;
    locale?: string;
};

export async function POST(request: Request) {
    const payload = (await request.json().catch(() => null)) as ContactPayload | null;

    if (!payload?.name || !payload?.email || !payload?.topic || !payload?.message) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL ?? "AGD LAW AI <onboarding@resend.dev>";

    if (resendKey && to) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
            from,
            to,
            subject: `AGD contact request: ${payload.topic}`,
            replyTo: payload.email,
            text: [
                `Name: ${payload.name}`,
                `Email: ${payload.email}`,
                `Phone: ${payload.phone ?? ""}`,
                `Country: ${payload.country ?? ""}`,
                `Topic: ${payload.topic}`,
                `Locale: ${payload.locale ?? ""}`,
                "",
                payload.message,
            ].join("\n"),
        });
    }

    return NextResponse.json({ ok: true });
}

