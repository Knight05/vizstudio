import "server-only";
import { createSign, randomInt } from "node:crypto";

/**
 * Zero-dependency Google Cloud Storage client (REST + service-account JWT).
 * Used to provision a per-client bucket on signup:
 *
 *   1. Create bucket  vizstudio-<company><6 digits>
 *      - us-south1 (Dallas), Standard, soft-delete 7 days
 *      - public: allUsers -> Storage Object Viewer
 *   2. Copy every object from the source bucket (GCS server-side rewrite)
 *   3. Rewrite every manifest.json (root + subfolders), replacing the
 *      source bucket name with the new bucket name
 *
 * Env vars (see .env.example / GCP-SETUP.md):
 *   GCP_PROJECT_ID, GCP_SERVICE_ACCOUNT_EMAIL, GCP_PRIVATE_KEY
 *   GCS_SOURCE_BUCKET (defaults to vizstudio-prod9021)
 */

const API = "https://storage.googleapis.com/storage/v1";
const UPLOAD_API = "https://storage.googleapis.com/upload/storage/v1";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/devstorage.full_control";

export const SOURCE_BUCKET = process.env.GCS_SOURCE_BUCKET ?? "vizstudio-prod9021";

// ─── Auth ────────────────────────────────────────────────

let cachedToken: { token: string; expires: number } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60_000) {
    return cachedToken.token;
  }

  const email = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  // Vercel env vars store newlines as literal "\n" - restore them.
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
  if (!res.ok) throw new Error(`GCP token exchange failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function gcs(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
}

// ─── Bucket operations ───────────────────────────────────

export function makeBucketName(company: string): string {
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40) || "client";
  const digits = String(randomInt(0, 1_000_000)).padStart(6, "0");
  return `vizstudio-${slug}${digits}`;
}

async function createBucket(name: string): Promise<void> {
  const project = process.env.GCP_PROJECT_ID;
  if (!project) throw new Error("GCP_PROJECT_ID not configured");

  const res = await gcs(`${API}/b?project=${encodeURIComponent(project)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      location: "US-SOUTH1", // Dallas
      storageClass: "STANDARD",
      iamConfiguration: {
        uniformBucketLevelAccess: { enabled: true },
        publicAccessPrevention: "inherited", // allow public access
      },
      softDeletePolicy: { retentionDurationSeconds: "604800" }, // 7-day soft delete
    }),
  });
  if (!res.ok) throw new Error(`Bucket create failed (${name}): ${res.status} ${await res.text()}`);
}

async function makeBucketPublic(name: string): Promise<void> {
  const get = await gcs(`${API}/b/${name}/iam`);
  if (!get.ok) throw new Error(`IAM read failed: ${get.status} ${await get.text()}`);
  const policy = (await get.json()) as { bindings?: { role: string; members: string[] }[] };

  const bindings = policy.bindings ?? [];
  bindings.push({ role: "roles/storage.objectViewer", members: ["allUsers"] });

  const put = await gcs(`${API}/b/${name}/iam`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...policy, bindings }),
  });
  if (!put.ok) throw new Error(`IAM update failed: ${put.status} ${await put.text()}`);
}

async function listObjects(bucket: string): Promise<{ name: string; contentType?: string }[]> {
  const items: { name: string; contentType?: string }[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`${API}/b/${bucket}/o`);
    url.searchParams.set("maxResults", "1000");
    url.searchParams.set("fields", "items(name,contentType),nextPageToken");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await gcs(url.toString());
    if (!res.ok) throw new Error(`List objects failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      items?: { name: string; contentType?: string }[];
      nextPageToken?: string;
    };
    items.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return items;
}

async function copyObject(srcBucket: string, dstBucket: string, object: string): Promise<void> {
  const enc = encodeURIComponent(object);
  let rewriteToken: string | undefined;
  do {
    const url = new URL(`${API}/b/${srcBucket}/o/${enc}/rewriteTo/b/${dstBucket}/o/${enc}`);
    if (rewriteToken) url.searchParams.set("rewriteToken", rewriteToken);
    const res = await gcs(url.toString(), { method: "POST" });
    if (!res.ok) throw new Error(`Copy failed (${object}): ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { done: boolean; rewriteToken?: string };
    rewriteToken = data.done ? undefined : data.rewriteToken;
  } while (rewriteToken);
}

async function downloadText(bucket: string, object: string): Promise<string> {
  const res = await gcs(`${API}/b/${bucket}/o/${encodeURIComponent(object)}?alt=media`);
  if (!res.ok) throw new Error(`Download failed (${object}): ${res.status} ${await res.text()}`);
  return res.text();
}

async function uploadText(
  bucket: string,
  object: string,
  body: string,
  contentType = "application/json"
): Promise<void> {
  const url = `${UPLOAD_API}/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(object)}`;
  const res = await gcs(url, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
  if (!res.ok) throw new Error(`Upload failed (${object}): ${res.status} ${await res.text()}`);
}

async function deleteObject(bucket: string, object: string): Promise<void> {
  const res = await gcs(`${API}/b/${bucket}/o/${encodeURIComponent(object)}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Delete failed (${object}): ${res.status} ${await res.text()}`);
  }
}

async function setCacheControl(bucket: string, object: string, cacheControl: string): Promise<void> {
  const res = await gcs(`${API}/b/${bucket}/o/${encodeURIComponent(object)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cacheControl }),
  });
  if (!res.ok) throw new Error(`Metadata patch failed (${object}): ${res.status} ${await res.text()}`);
}

// Tiny concurrency pool - keeps the copy fast without hammering the API.
async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      await fn(item);
    }
  });
  await Promise.all(workers);
}

// ─── Public API ──────────────────────────────────────────

/**
 * Full provisioning flow for a new client. Returns the new bucket name.
 */
export async function provisionClientBucket(company: string): Promise<string> {
  const bucket = makeBucketName(company);

  await createBucket(bucket);
  await makeBucketPublic(bucket);

  const objects = await listObjects(SOURCE_BUCKET);
  const manifests = objects.filter((o) => o.name === "manifest.json" || o.name.endsWith("/manifest.json"));
  const rest = objects.filter((o) => !manifests.includes(o));

  // Plain files: server-side copy.
  await pool(rest, 8, (o) => copyObject(SOURCE_BUCKET, bucket, o.name));

  // Manifests (root + every subfolder): rewrite bucket references.
  await pool(manifests, 8, async (o) => {
    const text = await downloadText(SOURCE_BUCKET, o.name);
    await uploadText(bucket, o.name, text.replaceAll(SOURCE_BUCKET, bucket));
  });

  console.log(`[gcs] provisioned ${bucket}: ${rest.length} files copied, ${manifests.length} manifests rewritten`);
  return bucket;
}

// ─── Suspension (unpaid clients) ─────────────────────────

const SUSPEND_MARKER = "__viz_suspended.json";

/**
 * Self-contained placeholder that replaces each chart's script.js while a
 * client is suspended. Renders a branded "contact us" panel that fills the
 * Looker Studio component - no dscc dependency, no data access.
 */
const PLACEHOLDER_SCRIPT = `(function () {
  document.documentElement.style.height = "100%";
  document.body.style.cssText =
    "height:100%;margin:0;display:flex;align-items:center;justify-content:center;" +
    "background:#0e1116;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;";
  var box = document.createElement("div");
  box.style.cssText = "text-align:center;padding:24px;max-width:440px;";
  box.innerHTML =
    '<div style="font-size:22px;font-weight:700;letter-spacing:.04em;color:#e8ecf1;margin-bottom:10px;">' +
    'Viz<span style="color:#4f8cff;">.</span>Studio</div>' +
    '<div style="font-size:13px;line-height:1.65;color:#9aa4b2;">' +
    'This visualization is currently inactive.<br/>' +
    'Contact us at <span style="color:#4f8cff;font-weight:600;">vizstudio.io</span> to reactivate your charts.</div>';
  box.setAttribute("role", "status");
  document.body.appendChild(box);
})();`;

/**
 * Replace every script.js in the client bucket with the placeholder.
 * Placeholders are uploaded with Cache-Control: no-store so a later restore
 * takes effect immediately instead of waiting out the default 1h cache.
 * Returns the number of scripts replaced.
 */
export async function suspendClientBucket(bucket: string): Promise<number> {
  const objects = await listObjects(bucket);
  const scripts = objects.filter((o) => o.name.endsWith("script.js"));

  await pool(scripts, 8, async (o) => {
    await uploadText(bucket, o.name, PLACEHOLDER_SCRIPT, "application/javascript");
    await setCacheControl(bucket, o.name, "no-store");
  });
  await uploadText(bucket, SUSPEND_MARKER, JSON.stringify({ suspendedAt: new Date().toISOString() }));

  console.log(`[gcs] suspended ${bucket}: ${scripts.length} scripts replaced`);
  return scripts.length;
}

/**
 * Restore original chart scripts by server-side copying them back from the
 * source (template) bucket. Returns the number of scripts restored.
 */
export async function restoreClientBucket(bucket: string): Promise<number> {
  const objects = await listObjects(SOURCE_BUCKET);
  const scripts = objects.filter((o) => o.name.endsWith("script.js"));

  await pool(scripts, 8, (o) => copyObject(SOURCE_BUCKET, bucket, o.name));
  await deleteObject(bucket, SUSPEND_MARKER);

  console.log(`[gcs] restored ${bucket}: ${scripts.length} scripts copied back`);
  return scripts.length;
}
