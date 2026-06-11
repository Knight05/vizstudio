import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getRepoJsonFile, putRepoJsonFile } from "@/lib/github";

export const maxDuration = 30;

const FILES: Record<string, string> = {
  charts: "src/data/charts.json",
  "site-copy": "src/data/site-copy.json",
};

function validate(file: string, content: unknown): string | null {
  if (file === "charts") {
    const c = content as { categories?: unknown; charts?: unknown };
    if (!Array.isArray(c?.categories) || !Array.isArray(c?.charts)) {
      return "charts.json must have 'categories' and 'charts' arrays";
    }
    if ((c.charts as unknown[]).length < 1) return "charts array is empty";
  }
  if (file === "site-copy") {
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return "site-copy.json must be an object";
    }
    for (const [k, v] of Object.entries(content as Record<string, unknown>)) {
      if (typeof v !== "string") return `site-copy value for '${k}' must be a string`;
    }
  }
  return null;
}

/** GET /api/admin/content?file=charts|site-copy → current live version from GitHub main */
export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const file = new URL(req.url).searchParams.get("file") ?? "";
  const path = FILES[file];
  if (!path) return NextResponse.json({ error: "Unknown file" }, { status: 400 });

  try {
    const { json, sha } = await getRepoJsonFile(path);
    return NextResponse.json({ content: json, sha });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

/** PUT /api/admin/content  Body: { file, content, sha } → commit to main */
export async function PUT(req: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = (await req.json().catch(() => null)) as
    | { file?: string; content?: unknown; sha?: string }
    | null;
  const file = body?.file ?? "";
  const path = FILES[file];
  if (!path || !body?.content || !body?.sha) {
    return NextResponse.json(
      { error: "file, content and sha are required" },
      { status: 400 }
    );
  }

  const invalid = validate(file, body.content);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    const { commitSha, newSha } = await putRepoJsonFile(
      path,
      body.content,
      body.sha,
      `content: update ${path} via admin (${user.email})`
    );
    return NextResponse.json({ ok: true, commitSha, sha: newSha });
  } catch (e) {
    const msg = (e as Error).message;
    const conflict = msg.includes("409") || msg.includes("does not match");
    return NextResponse.json(
      {
        error: conflict
          ? "Content changed since you loaded it — reload and re-apply your edits."
          : msg,
      },
      { status: conflict ? 409 : 502 }
    );
  }
}
