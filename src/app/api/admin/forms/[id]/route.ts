import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const STATUSES = ["new", "read", "resolved"] as const;

/** PATCH /api/admin/forms/:id  Body: { status } */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status;
  if (!status || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json(
      { error: "status must be one of: new, read, resolved" },
      { status: 400 }
    );
  }

  try {
    const sub = await prisma.formSubmission.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, id: sub.id, status: sub.status });
  } catch {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
}

/** DELETE /api/admin/forms/:id */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.formSubmission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
}
