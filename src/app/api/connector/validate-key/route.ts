import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPaid } from "@/lib/billing";
import { CONNECTOR_TRIAL_DAYS } from "@/lib/calendar-keys";

/**
 * Public license-key validation for the Google Calendar Connector.
 *
 * The connector (Apps Script) calls this instead of reading the old
 * license-keys Google Sheet — the `license_keys` table is the single source
 * of truth:
 *
 *   POST /api/connector/validate-key   body: { "key": "CAL-XXXXXXXXXXXX-NNN" }
 *   GET  /api/connector/validate-key?key=CAL-...   (manual testing)
 *
 * Response — always JSON, always 200 for a well-formed request so the
 * connector can branch on `status` instead of HTTP codes:
 *   {
 *     valid:   boolean,
 *     status:  "active" | "trial" | "expired" | "revoked" | "not_found",
 *     message: string,        // safe to surface to the end user
 *     trialEndsAt?: string,   // ISO timestamp, present while status="trial"
 *   }
 *
 * Policy ("14 days free, then billing"): every key is free for
 * CONNECTOR_TRIAL_DAYS after creation; after that it stays valid only while
 * the owner's subscription is paid and in good standing (isPaid). Revoked
 * keys always fail. The key itself is the credential — high-entropy and
 * unguessable — so the endpoint takes no other auth.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Best-effort, in-memory rate limit (per warm serverless instance) — same
// pattern as /api/forms. Generous: the connector caches validations.
const RATE_LIMIT_MAX = 30; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60s per IP
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(req: NextRequest): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

async function validateKey(raw: string | null) {
  const key = (raw ?? "").trim();
  if (!key || key.length > 64) {
    return reply(
      { valid: false, status: "not_found", message: "No license key provided." },
      400,
    );
  }

  // Exact match first, then uppercase — keys are stored uppercase but users
  // sometimes paste them lowercased.
  const lookup = (k: string) =>
    prisma.licenseKey.findUnique({
      where: { key: k },
      include: { user: { include: { subscription: true } } },
    });
  const row = (await lookup(key)) ?? (await lookup(key.toUpperCase()));

  if (!row) {
    return reply({
      valid: false,
      status: "not_found",
      message:
        "This license key wasn't recognized. Check for typos, or find your key in your dashboard at vizstudio.io.",
    });
  }

  // Touch lastUsedAt so /admin can see which keys are actually in use.
  // Awaited (serverless may freeze after the response) but never fatal.
  await prisma.licenseKey
    .update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  if (!row.active || row.revokedAt) {
    return reply({
      valid: false,
      status: "revoked",
      message:
        "This license key has been revoked. Manage your keys at vizstudio.io/dashboard.",
    });
  }

  if (isPaid(row.user.subscription)) {
    return reply({ valid: true, status: "active", message: "License active." });
  }

  const trialEnds = new Date(
    row.createdAt.getTime() + CONNECTOR_TRIAL_DAYS * DAY_MS,
  );
  if (Date.now() < trialEnds.getTime()) {
    const daysLeft = Math.ceil((trialEnds.getTime() - Date.now()) / DAY_MS);
    return reply({
      valid: true,
      status: "trial",
      trialEndsAt: trialEnds.toISOString(),
      message: `Free trial — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left. Upgrade at vizstudio.io/pricing to keep access.`,
    });
  }

  return reply({
    valid: false,
    status: "expired",
    message: `Your ${CONNECTOR_TRIAL_DAYS}-day free trial has ended. Upgrade at vizstudio.io/pricing to keep using the connector.`,
  });
}

export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return reply(
      { valid: false, status: "rate_limited", message: "Too many requests — try again in a minute." },
      429,
    );
  }
  let key: string | null = null;
  try {
    const body = (await req.json()) as { key?: unknown };
    if (typeof body?.key === "string") key = body.key;
  } catch {
    // missing/malformed JSON — handled by validateKey's empty-key check
  }
  return validateKey(key);
}

export async function GET(req: NextRequest) {
  if (rateLimited(req)) {
    return reply(
      { valid: false, status: "rate_limited", message: "Too many requests — try again in a minute." },
      429,
    );
  }
  return validateKey(req.nextUrl.searchParams.get("key"));
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
