import { APIError } from "better-auth/api";
import { prisma } from "./prisma";

/**
 * Account-level brute-force defense for email + password sign-in.
 *
 * The per-IP rate limiter and reCAPTCHA in `auth.ts` throttle request volume
 * from a single source, but they don't stop a *slow* or *distributed* attack
 * that guesses one account's password from many IPs at a low request rate.
 * This module closes that gap with a progressive, per-(account+IP) lockout
 * backed by the `login_attempts` table.
 *
 * Policy (progressive):
 *   - Every failed sign-in increments a counter for that (email, ip) pair.
 *   - After THRESHOLD consecutive failures, the pair is locked. Each successive
 *     lock lasts longer: 15m → 30m → 60m → 2h → … capped at MAX_LOCK_MS.
 *   - A successful sign-in clears the record entirely.
 *   - If no failure occurs within ATTEMPT_WINDOW_MS, the counter decays so a
 *     few scattered typos over days never accumulate into a lockout.
 *
 * All DB work fails *open*: if the database is unreachable we never block a
 * legitimate sign-in. The only thing that ever throws here is the deliberate
 * "account temporarily locked" 429.
 */

/** Consecutive failures (per account+IP) that trigger the first lock. */
const THRESHOLD = 5;
/** First lock duration; each subsequent lock doubles it. */
const BASE_LOCK_MS = 15 * 60 * 1000; // 15 minutes
/** Upper bound on a single lock, no matter how many times it escalates. */
const MAX_LOCK_MS = 24 * 60 * 60 * 1000; // 24 hours
/** Idle gap after which the failure counter resets (forgives old typos). */
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Duration of the Nth lock (level is 1-based). */
function lockDurationMs(level: number): number {
  const ms = BASE_LOCK_MS * 2 ** Math.max(0, level - 1);
  return Math.min(ms, MAX_LOCK_MS);
}

/** Normalize so "User@x.com " and "user@x.com" share one bucket. */
function normEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

function normIp(ip: string | undefined | null): string {
  return (ip ?? "").trim() || "unknown";
}

/**
 * Throw a 429 if this (email, ip) pair is currently locked out.
 * Call this in the `before` hook, ahead of credential verification.
 */
export async function assertNotLocked(
  emailRaw: string | undefined | null,
  ipRaw: string | undefined | null,
): Promise<void> {
  const email = normEmail(emailRaw);
  const ipAddress = normIp(ipRaw);
  if (!email) return;

  let rec: { lockedUntil: Date | null } | null = null;
  try {
    rec = await prisma.loginAttempt.findUnique({
      where: { email_ipAddress: { email, ipAddress } },
      select: { lockedUntil: true },
    });
  } catch (err) {
    // Fail open — never lock people out because the DB hiccuped.
    console.error("[brute-force] lookup failed, allowing attempt:", err);
    return;
  }

  if (!rec?.lockedUntil) return;
  const remainingMs = rec.lockedUntil.getTime() - Date.now();
  if (remainingMs <= 0) return;

  const retryAfter = Math.ceil(remainingMs / 1000);
  const minutes = Math.ceil(retryAfter / 60);
  throw new APIError(
    "TOO_MANY_REQUESTS",
    {
      code: "ACCOUNT_TEMPORARILY_LOCKED",
      message: `Too many failed sign-in attempts. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }, or reset your password.`,
    },
    { "Retry-After": String(retryAfter) },
  );
}

/**
 * Record one failed sign-in and apply a lock once the threshold is reached.
 * Call this in the `after` hook only when the attempt genuinely failed on
 * credentials (HTTP 401), so locks, captcha rejects, etc. don't double-count.
 */
export async function recordFailedLogin(
  emailRaw: string | undefined | null,
  ipRaw: string | undefined | null,
): Promise<void> {
  const email = normEmail(emailRaw);
  const ipAddress = normIp(ipRaw);
  if (!email) return;

  try {
    const now = new Date();
    const existing = await prisma.loginAttempt.findUnique({
      where: { email_ipAddress: { email, ipAddress } },
    });

    if (!existing) {
      await prisma.loginAttempt.create({
        data: { email, ipAddress, failCount: 1, lastFailedAt: now },
      });
      return;
    }

    // Decay: a long quiet gap forgives prior near-misses.
    const decayed = now.getTime() - existing.lastFailedAt.getTime() > ATTEMPT_WINDOW_MS;
    let failCount = (decayed ? 0 : existing.failCount) + 1;
    let lockoutLevel = existing.lockoutLevel;
    let lockedUntil = existing.lockedUntil;

    if (failCount >= THRESHOLD) {
      lockoutLevel = existing.lockoutLevel + 1;
      lockedUntil = new Date(now.getTime() + lockDurationMs(lockoutLevel));
      failCount = 0; // start a fresh count for the next lock tier
    }

    await prisma.loginAttempt.update({
      where: { email_ipAddress: { email, ipAddress } },
      data: { failCount, lockoutLevel, lockedUntil, lastFailedAt: now },
    });
  } catch (err) {
    // Never let bookkeeping failures surface to the user.
    console.error("[brute-force] failed to record attempt:", err);
  }
}

/**
 * Clear all failure state for this (email, ip) pair after a successful login.
 */
export async function clearFailedLogins(
  emailRaw: string | undefined | null,
  ipRaw: string | undefined | null,
): Promise<void> {
  const email = normEmail(emailRaw);
  const ipAddress = normIp(ipRaw);
  if (!email) return;

  try {
    await prisma.loginAttempt.deleteMany({ where: { email, ipAddress } });
  } catch (err) {
    console.error("[brute-force] failed to clear attempts:", err);
  }
}
