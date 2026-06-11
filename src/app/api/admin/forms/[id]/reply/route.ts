import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const FROM = process.env.RESEND_FROM ?? "Viz Studio <noreply@vizstudio.io>";

/** POST /api/admin/forms/:id/reply  Body: { subject, body } */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as
    | { subject?: string; body?: string }
    | null;
  const subject = body?.subject?.trim();
  const text = body?.body?.trim();
  if (!subject || !text) {
    return NextResponse.json(
      { error: "subject and body are required" },
      { status: 400 }
    );
  }

  const sub = await prisma.formSubmission.findUnique({ where: { id } });
  if (!sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (!sub.email) {
    return NextResponse.json(
      { error: "Submission has no email address" },
      { status: 400 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: sendErr } = await resend.emails.send({
    from: FROM,
    to: sub.email,
    replyTo: "hello@vizstudio.io",
    subject,
    text,
  });
  if (sendErr) {
    return NextResponse.json({ error: sendErr.message }, { status: 502 });
  }

  // Record the reply on the submission payload and mark resolved.
  const payload =
    sub.payload && typeof sub.payload === "object" && !Array.isArray(sub.payload)
      ? (sub.payload as Record<string, unknown>)
      : {};
  const replies = Array.isArray(payload.adminReplies)
    ? (payload.adminReplies as unknown[])
    : [];
  replies.push({
    by: user.email,
    at: new Date().toISOString(),
    subject,
    body: text,
  });

  await prisma.formSubmission.update({
    where: { id },
    data: { status: "resolved", payload: { ...payload, adminReplies: replies } },
  });

  return NextResponse.json({ ok: true, to: sub.email });
}
