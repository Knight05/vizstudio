import "server-only";

/**
 * Minimal GitHub Contents API client used by the admin content editor.
 * Edits are committed to main; Vercel auto-deploys (~1-2 min).
 *
 * Requires GITHUB_PAT (fine-grained token with contents:write on the repo).
 */
const REPO = process.env.GITHUB_REPO ?? "Knight05/vizstudio";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";

function token(): string {
  const t = process.env.GITHUB_PAT;
  if (!t) throw new Error("GITHUB_PAT is not configured");
  return t;
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${token()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getRepoJsonFile(
  path: string
): Promise<{ json: unknown; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  const raw = Buffer.from(data.content, "base64").toString("utf-8");
  return { json: JSON.parse(raw), sha: data.sha };
}

export async function putRepoJsonFile(
  path: string,
  json: unknown,
  sha: string,
  message: string
): Promise<{ commitSha: string; newSha: string }> {
  const content = Buffer.from(
    JSON.stringify(json, null, 2) + "\n",
    "utf-8"
  ).toString("base64");

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ message, content, sha, branch: BRANCH }),
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    commit: { sha: string };
    content: { sha: string };
  };
  return { commitSha: data.commit.sha, newSha: data.content.sha };
}
