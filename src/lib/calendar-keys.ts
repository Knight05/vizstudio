import "server-only";
import { randomBytes, randomInt } from "node:crypto";

/**
 * Calendar Connector license keys.
 *
 * Keys live in the `license_keys` table — the single source of truth (the
 * old license-keys Google Sheet is retired). A key is issued at signup by
 * provisionNewUser, listed in the client portal, and validated live by the
 * connector against POST /api/connector/validate-key.
 *
 * Validity policy ("14 days free, then billing"):
 *   - every key gets a CONNECTOR_TRIAL_DAYS free window from its createdAt
 *   - after that it stays valid only while the owner's subscription is paid
 *     and in good standing (see isPaid in billing.ts)
 *   - revoked keys are always invalid
 */

const KEY_PREFIX = "CAL";

/** Free window (days) before a key requires a paid subscription. */
export const CONNECTOR_TRIAL_DAYS = 14;

/** CAL-XXXXXXXXXXXX-NNN - 12 uppercase hex + a 3-digit suffix. */
export function generateCalendarKey(): string {
  const body = randomBytes(6).toString("hex").toUpperCase(); // 12 hex chars
  const seq = String(randomInt(0, 1000)).padStart(3, "0");
  return `${KEY_PREFIX}-${body}-${seq}`;
}
