import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      licenseKeys: {
        where: { revokedAt: null },
        orderBy: { createdAt: "asc" },
      },
      favorites: true,
    },
  });
  if (!user) redirect("/login?next=/dashboard");

  const tier = user.subscription?.tier ?? "FREE";
  const status = user.subscription?.status ?? "active";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-page px-6 py-10">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="font-sans text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-[12.5px] text-text-dim mt-1">
              {user.email}
            </p>
          </div>
          <form action="/api/stripe/portal" method="POST">
            <button type="submit" className="btn">
              Manage billing →
            </button>
          </form>
        </div>

        {/* Plan card */}
        <section className="card p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-muted mb-2">
                Current plan
              </h4>
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-3xl font-semibold">{tier}</span>
                <span className="pill">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === "active" || status === "trialing"
                        ? "bg-accent-green"
                        : "bg-accent-amber"
                    }`}
                  />
                  {status}
                </span>
              </div>
              {user.subscription?.currentPeriodEnd && (
                <div className="mt-2 text-[12px] text-text-dim">
                  {user.subscription.cancelAtPeriodEnd
                    ? `Cancels on ${formatDate(user.subscription.currentPeriodEnd)}`
                    : `Renews on ${formatDate(user.subscription.currentPeriodEnd)}`}
                </div>
              )}
            </div>

            <div className="text-right">
              {tier === "FREE" ? (
                <Link href="/pricing" className="btn btn-primary">
                  Upgrade to Pro →
                </Link>
              ) : (
                <div className="text-[12px] text-text-dim max-w-[32ch]">
                  All 118 charts unlocked. Every palette. No watermark.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* License keys */}
        <DashboardClient
          initialKeys={user.licenseKeys.map((k) => ({
            id: k.id,
            key: k.key,
            label: k.label ?? null,
            createdAt: k.createdAt.toISOString(),
            lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          }))}
          tier={tier}
        />

        {/* Favorites */}
        <section className="mt-10">
          <h2 className="cat-h2 mb-4">
            <span>Favorites</span>
            <span className="count">{user.favorites.length}</span>
            <span className="line" />
          </h2>
          {user.favorites.length === 0 ? (
            <div className="card p-6 text-[13px] text-text-dim">
              No favorites yet. Browse the{" "}
              <Link href="/showcase" className="text-text underline">showcase</Link>{" "}
              and star the charts you use most.
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
              {user.favorites.map((f) => (
                <Link
                  key={f.id}
                  href={`/charts/${f.chartId}`}
                  className="card p-3 text-[12px] text-text hover:bg-panel-2"
                >
                  {f.chartId}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
