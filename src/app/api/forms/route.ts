import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";

/**
 * Public endpoint that receives submissions from the static marketing
 * site's forms (signup / suggest / subscribe / reportissue). CORS-enabled so
 * the static site (different origin) can POST to it.
 *
 * Hardening:
 *  - hard request-body size cap (before JSON parse)
 *  - strict zod schema: every field is length-capped and unknown keys are
 *    stripped (no unbounded passthrough payload)
 *  - all stored strings are sanitized (control chars / null bytes removed)
 *  - silent honeypot
 *  - best-effort per-IP rate limiting
 */

const ALLOWED_FORMS = ["signup", "suggest", "subscribe", "reportissue"] as const;

// Reject obviously oversized bodies before we even parse them.
const MAX_BODY_BYTES = 16 * 1024; // 16 KB

// Best-effort, in-memory rate limit (per warm serverless instance).
const RATE_LIMIT_MAX = 10; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60s per IP
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // opportunistic cleanup so the map can't grow unbounded
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }
  rec.count += 1;
  return rec.count > RATE_LIMIT_MAX;
}

// Strip null bytes and control chars (keep tab / newline / carriage return),
// trim, and defensively cap length.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
function clean(s: string | undefined | null, max: number): string | null {
  if (s == null) return null;
  const stripped = s.replace(CONTROL_CHARS, "").trim();
  if (!stripped) return null;
  return stripped.slice(0, max);
}

const bodySchema = z
  .object({
    form: z.enum(ALLOWED_FORMS),
    email: z.string().max(254).optional(),
    name: z.string().max(120).optional(),
    chart_name: z.string().max(160).optional(), // suggest form
    company: z.string().max(160).optional(), // signup form
    role: z.string().max(80).optional(), // signup form
    message: z.string().max(4000).optional(),
    description: z.string().max(4000).optional(), // site forms use "description"
    category: z.string().max(60).optional(), // report-issue category
    source: z.string().max(300).optional(),
    // honeypot - bots fill this, humans never see it
    website: z.string().max(200).optional(),
    // reCAPTCHA v3 token (action = form name). Verified server-side; the
    // check is skipped entirely when RECAPTCHA_SECRET_KEY isn't configured.
    recaptchaToken: z.string().max(5000).optional(),
  })
  .strip(); // drop any unknown keys instead of storing them

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (rateLimited(ip)) {
    return cors(
      NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 }),
    );
  }

  // Reject oversized payloads up front.
  const declaredLen = Number(req.headers.get("content-length") ?? "0");
  if (declaredLen > MAX_BODY_BYTES) {
    return cors(
      NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 }),
    );
  }

  // Read the raw body so we can enforce the size cap even when no/oversized
  // content-length header is sent, then parse.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return cors(
      NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 }),
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return cors(NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return cors(NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 }));
  }
  const data = parsed.data;

  // Honeypot tripped - pretend success, store nothing.
  if (data.website && data.website.trim()) {
    return cors(NextResponse.json({ ok: true }));
  }

  // reCAPTCHA v3 - token action must match the form name (clients mint
  // tokens with action = form). No-ops when the secret key isn't set.
  const captcha = await verifyRecaptcha(data.recaptchaToken, {
    action: data.form,
    ip: ip === "unknown" ? undefined : ip,
  });
  if (!captcha.ok) {
    return cors(
      NextResponse.json({ ok: false, error: "Verification failed" }, { status: 400 }),
    );
  }

  const form = data.form;
  const email = clean(data.email, 254);
  // Validate email shape only if one was supplied.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return cors(NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 }));
  }

  // For the suggest form the chart name is the most useful "name" to surface.
  const name = clean(data.name, 120) ?? clean(data.chart_name, 160);
  const text = clean(data.message, 4000) ?? clean(data.description, 4000);

  // Only persist known, sanitized extras - never arbitrary keys.
  const extras: Record<string, string> = {};
  const category = clean(data.category, 60);
  const company = clean(data.company, 160);
  const role = clean(data.role, 80);
  const chartName = clean(data.chart_name, 160);
  if (category) extras.category = category;
  if (company) extras.company = company;
  if (role) extras.role = role;
  if (cha