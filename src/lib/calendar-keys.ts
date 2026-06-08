import "server-only";
import { createHash, createSign, randomBytes, randomInt } from "node:crypto";

/**
 * Zero-dependency Google Sheets client (REST + service-account JWT) used to
 * issue a Calendar Connector license key for each new client on signup.
 *
 * The connector validates a user by SHA-256 hashing the key they paste and
 * looking it up in the "Licenses" tab of the license-keys spreadsheet. So for
 * every new account we:
 *   1. Generate a key            (CAL-XXXXXXXXXXXX-NNN)
 *   2. SHA-256 hash it           (lowercase hex)
 *   3. Append a row to "Sheet1"  (plaintext key, for admin reference)
 *   4. Append a row to "Licenses"(the hash the connector checks)
 *
 * Both rows: Email, Status="active", Created=today, Expires=today + 1 year.
 *
 * Env vars (shares the provisioner service account with gcs.ts):
 *   GCP_SERVICE_ACCOUNT_EMAIL, GCP_PRIVATE_KEY
 *   CALENDAR_KEYS_SHEET_ID   (the license-keys spreadsheet ID)
 *
 * Requires (one-time GCP setup):
 *   - Google Sheets API enabled in the project
 *   - the spreadsheet shared with GCP_SERVICE_ACCOUNT_EMAIL as Editor
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

// Tab names + the key prefix live here so they're easy to retune.
const KEYS_TAB = "Sheet1"; // plaintext: Key | Email | Status | Created | Expires
const LICENSES_TAB = "Licenses"; // hashed: Hash | Email | Status | Created | Expires
const KEY_PREFIX = "CAL";
const VALIDITY_YEARS = 1;

let cachedToken: { token: string; expires: number } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

async function getSheetsToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60_000) {
    return cachedToken.token;
  }
  const email = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  // Vercel stores newlines as literal "\n" — restore them.
  const key = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) {
    throw new Error("GCP_SERVICE_ACCOUNT_EMAIL / GCP_PRIVATE_KEY not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Sheets token exchange failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

/** CAL-XXXXXXXXXXXX-NNN — 12 uppercase hex + a 3-digit suffix. */
export function generateCalendarKey(): string {
  const body = randomBytes(6).toString("hex").toUpperCase(); // 12 hex chars
  const seq = String(randomInt(0, 1000)).padStart(3, "0");
  return `${KEY_PREFIX}-${body}-${seq}`;
}

export function hashCalendarKey(key: string): string {
  return createHash("sha256").update(key).digest("hex"); // lowercase hex
}

// M/D/YYYY to match the existing sheet rows.
function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

async function appendRow(sheetId: string, tab: string, row: string[]): Promise<void> {
  const token = await getSheetsToken();
  const url =
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tab)}!A:E:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    throw new Error(`Sheets append failed (${tab}): ${res.status} ${await res.text()}`);
  }
}

/**
 * Issue a Calendar Connector license key for a new client and record it in the
 * license-keys spreadsheet (plaintext + hashed tabs). Returns the plaintext key
 * so the caller can store it / email it to the user.
 *
 * Throws if the sheet write fails — the caller (provisionNewUser) swallows and
 * logs so this never blocks signup.
 */
export async function provisionCalendarKey(email: string): Promise<string> {
  const sheetId = process.env.CALENDAR_KEYS_SHEET_ID;
  if (!sheetId) throw new Error("CALENDAR_KEYS_SHEET_ID not configured");

  const key = generateCalendarKey();
  const hash = hashCalendarKey(key);

  const created = new Date();
  const expires = new Date(created);
  expires.setFullYear(expires.getFullYear() + VALIDITY_YEARS);
  const createdStr = formatDate(created);
  const expiresStr = formatDate(expires);

  // Plaintext key (admin reference) + the hash the connector validates against.
  await appendRow(sheetId, KEYS_TAB, [key, email, "active", createdStr, expiresStr]);
  await appendRow(sheetId, LICENSES_TAB, [hash, email, "active", createdStr, expiresStr]);

  console.log(`[calendar-keys] issued ${key} for ${email}`);
  return key;
}
