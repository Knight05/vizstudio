import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { suspendClientBucket, restoreClientBucket } from "@/lib/gcs";

/**
 * POST /api/admin/charts
 * Body: { userId: string, action: "suspend" | "restore" }
 *
 * Suspend  -> replaces every script.js in the client's GCS bucket with a
 *             branded "contact us" placeholder.
 * Restore  -> copies the original scripts back from the template bucket.
 */
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { userId?: string; action?: string }
    | null;
  const { userId, action } = body ?? {};
  if (!userId || (action !== "suspend" && action !== "restore")) {
    return NextResponse.json(
      { error: "userId and action ('suspend' | 'restore') are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { gcsBucket: true, email: true },
  });
  if (!user?.gcsBucket) {
    return NextResponse.json({ error: "Client has no provisioned bucket" }, { status: 404 });
  }

  try {
    const scripts =
      action === "suspend"
        ? await suspendClientBucket(user.gcsBucket)
        : await restoreClientBucket(user.gcsBucket);
    console.log(`[admin/charts] ${action} ${user.gcsBucket} (${user.email}) by ${session.user.email}`);
    return NextResponse.json({ ok: true, action, bucket: user.gcsBucket, scripts });
  } catch (err) {
    console.error(`[admin/charts] ${action} failed for ${user.gcsBucket}:`, err);
    return NextResponse.json({ error: "Operation failed - check server logs" }, { status: 500 });
  }
}
