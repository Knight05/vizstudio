import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: Record<string, unknown>[], cols: string[]): string {
  const head = cols.join(",");
  const body = rows
    .map((r) => cols.map((c) => csvCell(r[c])).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}

/** GET /api/admin/forms/export?tab=all|support|...|leads → CSV download */
export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") ?? "all";
  const stamp = new Date().toISOString().slice(0, 10);

  let csv: string;
  let filename: string;

  if (tab === "leads") {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(
      leads.map((l) => ({
        email: l.email,
        source: l.source,
        createdAt: l.createdAt.toISOString(),
      })),
      ["email", "source", "createdAt"]
    );
    filename = `leads-${stamp}.csv`;
  } else {
    const subs = await prisma.formSubmission.findMany({
      where: tab === "all" ? {} : { form: tab },
      orderBy: { createdAt: "desc" },
    });
    csv = toCsv(
      subs.map((s) => ({
        form: s.form,
        status: s.status,
        name: s.name,
        email: s.email,
        message: s.message,
        source: s.source,
        ip: s.ip,
        payload: s.payload,
        createdAt: s.createdAt.toISOString(),
      })),
      ["form", "status", "name", "email", "message", "source", "ip", "payload", "createdAt"]
    );
    filename = `forms-${tab}-${stamp}.csv`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
