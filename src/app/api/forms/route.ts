import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint that receives submissions from the static marketing
 * site's forms (signup / suggest / subscribe). CORS-enabled so the
 * static site (different origin) can POST to it.
 */

const ALLOWED_FORMS = ["signup", "suggest", "subscribe", "reportissue"] as const;

const bodySchema = z
  .object({
    form: z.enum(ALLOWED_FORMS),
    email: z.string().email().max(254).optional(),
    name: z.string().max(120).optional(),
    message: z.string().max(4000).optional(),
    description: z.string().max(4000).optional(), // site forms use "description"
    category: z.string().max(60).optional(), // report-issue category (kept in payload)
    source: z.string().max(300).optional(),
    // honeypot — bots fill this, humans never see it
    website: z.string().max(0).optional(),
  })
  .passthrough();

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return cors(NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return cors(NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 }));
  }
  const data = parsed.data;

  // Honeypot tripped — pretend success, store nothing.
  if (data.website) return cors(NextResponse.json({ ok: true }));

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const { form, email, name, message, description, source, ...rest } = data;
  delete (rest as Record<string, unknown>).website;
  const text = message ?? description ?? null;

  await prisma.formSubmission.create({
    data: {
      form,
      email: email ?? null,
      name: name ?? null,
      message: text,
      source: source ?? req.headers.get("referer") ?? null,
      ip,
      payload: Object.keys(rest).length ? (rest as object) : undefined,
    },
  });

  // Signup / subscribe emails also become Leads (deduped).
  if (email && (form === "subscribe" || form === "signup")) {
    await prisma.lead.upsert({
      where: { email },
      update: {},
      create: { email, source: form },
    });
  }

  return cors(NextResponse.json({ ok: true }));
}
