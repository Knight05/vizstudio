import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadManifest } from "@/lib/manifest";
import { provisionClientBucket } from "@/lib/gcs";
import { PortalClient } from "./portal-client";

export const metadata = {
  title: "Client Portal",
  robots: { index: false, follow: false },
};

// Concurrency guard: two parallel dashboard loads (double-click, reload during
// the ~minute-long copy) must not provision two buckets for the same user.
// Module-level map dedupes in-flight provisioning per warm instance.
const inflightProvisioning = new Map<string, Promise<string>>();

const TABS = ["overview", "charts", "billing", "downloads", "support", "settings"] as const;
type Tab = (typeof TABS)[number];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const initialTab: Tab = (TABS as readonly string[]).includes(params.tab ?? "")
    ? (params.tab as Tab)
    : "overview";
  const checkoutStatus = params.checkout ?? null;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/dashboard");

  const [user, downloadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        licenseKeys: {
          where: { revokedAt: null },
          orderBy: { createdAt: "asc" },
        },
        favorites: true,
      },
    }),
    prisma.download.count({ where: { userId: session.user.id } }),
  ]);
  if (!user) redirect("/login?next=/dashboard");

  const tier = user.subscription?.tier ?? "FREE";
  const status = user.subscription?.status ?? "active";

  // Signup provisioning can fail or lag - retry here so the client always
  // ends up with their own bucket. Never expose the shared prod bucket.
  let gcsBucket = user.gcsBucket;
  if (!gcsBucket && process.env.GCP_SERVICE_ACCOUNT_EMAIL) {
    try {
      let job = inflightProvisioning.get(user.id);
      if (!job) {
        const company = user.company || user.name || user.email.split("@")[0];
        job = provisionClientBucket(company)
          .then(async (bucket) => {
            await prisma.user.update({
              where: { id: user.id },
              data: { gcsBucket: bucket },
            });
            return bucket;
          })
          .finally(() => inflightProvisioning.delete(user.id));
        inflightProvisioning.set(user.id, job);
      }
      gcsBucket = await job;
    } catch (err) {
      console.error(`[dashboard] bucket retry failed for ${user.email}:`, err);
    }
  }

  // Plan label: prefer matching the configured PRO price IDs; otherwise infer
  // the interval from the billing-period length (covers Payment Link prices
  // that aren't mirrored into STRIPE_PRICE_PRO_* env vars).
  const subRow = user.subscription;
  const planLabel: "Monthly" | "Annual" | null = (() => {
    if (!subRow) return null;
    if (subRow.stripePriceId && subRow.stripePriceId === process.env.STRIPE_PRICE_PRO_YEARLY) return "Annual";
    if (subRow.stripePriceId && subRow.stripePriceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "Monthly";
    if (subRow.currentPeriodStart && subRow.currentPeriodEnd) {
      const days = (subRow.currentPeriodEnd.getTime() - subRow.currentPeriodStart.getTime()) / 86_400_000;
      if (days > 200) return "Annual";
      if (days > 0) return "Monthly";
    }
    return null;
  })();

  return (
    <PortalClient
      user={{
        name: user.name ?? null,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      }}
      tier={tier}
      planLabel={planLabel}
      status={status}
      periodEnd={user.subscription?.currentPeriodEnd?.toISOString() ?? null}
      cancelAtPeriodEnd={user.subscription?.cancelAtPeriodEnd ?? false}
      hasStripeCustomer={Boolean(user.subscription?.stripeCustomerId)}
      initialKeys={user.licenseKeys.map((k) => ({
        id: k.id,
        key: k.key,
        label: k.label ?? null,
        createdAt: k.createdAt.toISOString(),
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      }))}
      favorites={user.favorites.map((f) => ({ id: f.id, chartId: f.chartId }))}
      downloadCount={downloadCount}
      bucket={gcsBucket ?? ""}
      bucketProvisioned={Boolean(gcsBucket)}
      chartCount={loadManifest().components.length}
      initialTab={initialTab}
      checkoutStatus={checkoutStatus}
    />
  );
}
