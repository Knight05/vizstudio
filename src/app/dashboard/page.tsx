import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PortalClient } from "./portal-client";

export const metadata = { title: "Client Portal" };

export default async function DashboardPage() {
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

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-page px-6 py-10">
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-semibold tracking-tight">
            {user.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Client Portal"}
          </h1>
          <p className="text-[12.5px] text-text-dim mt-1">{user.email}</p>
        </div>

        <PortalClient
          user={{
            name: user.name ?? null,
            email: user.email,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt.toISOString(),
          }}
          tier={tier}
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
        />
      </main>
      <Footer />
    </>
  );
}
