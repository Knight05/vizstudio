import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin";
import { stripe } from "@/lib/stripe";
import { paymentStanding, usd } from "@/lib/billing";
import { PaymentBadge } from "../../payment-status";
import { ChartActions } from "../chart-actions";

type InvoiceRow = {
  id: string;
  number: string | null;
  date: number;
  amount: number;
  currency: string;
  status: string | null;
  hostedUrl: string | null;
  pdfUrl: string | null;
};

/** Live invoice history for a customer. Degrades to [] if Stripe is unreachable. */
async function fetchInvoices(customerId: string | null): Promise<InvoiceRow[]> {
  if (!customerId) return [];
  try {
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 24 });
    return invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created * 1000,
      amount: inv.amount_paid || inv.amount_due,
      currency: inv.currency,
      status: inv.status,
      hostedUrl: inv.hosted_invoice_url ?? null,
      pdfUrl: inv.invoice_pdf ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      licenseKeys: { orderBy: { createdAt: "desc" } },
      downloads: { orderBy: { createdAt: "desc" }, take: 25 },
      favorites: { orderBy: { createdAt: "desc" }, take: 25 },
    },
  });
  if (!user) notFound();

  const forms = user.email
    ? await prisma.formSubmission.findMany({
        where: { email: { equals: user.email, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        take: 25,
      })
    : [];

  const sub = user.subscription;
  const standing = paymentStanding(sub);
  const invoices = await fetchInvoices(sub?.stripeCustomerId ?? null);

  return (
    <section className="grid gap-4">
      <div className="flex items-center gap-3">
        <Link href="/vz-ops-37/clients" className="pill hover:bg-panel-2">
          ← All clients
        </Link>
        <h2 className="font-sans text-xl font-semibold">
          {user.name ?? user.email}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted">
            Account
          </div>
          <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
            <dt className="text-muted">Email</dt>
            <dd>
              {user.email}
              {user.emailVerified ? "" : " (unverified)"}
            </dd>
            <dt className="text-muted">Company</dt>
            <dd>{user.company ?? "-"}</dd>
            <dt className="text-muted">Joined</dt>
            <dd>{formatDate(user.createdAt)}</dd>
            <dt className="text-muted">Bucket</dt>
            <dd className="break-all">{user.gcsBucket ?? "not provisioned"}</dd>
          </dl>
          <div className="mt-4 flex items-center gap-2 text-[13px]">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Charts
            </span>
            <ChartActions userId={user.id} hasBucket={!!user.gcsBucket} />
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted">
            Subscription
          </div>
          {sub ? (
            <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
              <dt className="text-muted">Plan</dt>
              <dd>{standing.planLabel}</dd>
              <dt className="text-muted">Payment</dt>
              <dd>
                <PaymentBadge sub={sub} />
                {standing.endsAtPeriodEnd && (
                  <span className="ml-2 text-[11px] text-accent-amber">
                    cancels at period end
                  </span>
                )}
              </dd>
              <dt className="text-muted">Paid</dt>
              <dd>
                {standing.paid ? (
                  <>
                    Yes
                    {standing.monthlyValue > 0 && (
                      <span className="text-text-dim">
                        {" · "}
                        {usd(standing.monthlyValue)}/mo equiv.
                      </span>
                    )}
                  </>
                ) : (
                  "No"
                )}
              </dd>
              <dt className="text-muted">Days left</dt>
              <dd>
                {standing.paid && standing.daysLeft !== null ? (
                  standing.daysLeft < 0 ? (
                    <span className="text-red-500">
                      {Math.abs(standing.daysLeft)} days overdue
                    </span>
                  ) : (
                    <span
                      className={
                        standing.daysLeft <= 7 ? "text-accent-amber" : undefined
                      }
                    >
                      {standing.daysLeft} day{standing.daysLeft === 1 ? "" : "s"}
                    </span>
                  )
                ) : (
                  "—"
                )}
              </dd>
              <dt className="text-muted">Auto-renew</dt>
              <dd>
                {standing.paid ? (standing.autoRenew ? "On" : "Off") : "—"}
              </dd>
              <dt className="text-muted">Period</dt>
              <dd>
                {sub.currentPeriodStart ? formatDate(sub.currentPeriodStart) : "-"} →{" "}
                {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "-"}
              </dd>
              <dt className="text-muted">Stripe</dt>
              <dd className="break-all text-text-dim">
                {sub.stripeCustomerId ? (
                  <a
                    className="underline hover:no-underline"
                    href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {sub.stripeCustomerId}
                  </a>
                ) : (
                  "-"
                )}
              </dd>
            </dl>
          ) : (
            <p className="text-[13px] text-text-dim">No subscription (free).</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 text-[10px] uppercase tracking-widest text-muted">
          License keys ({user.licenseKeys.length})
        </div>
        {user.licenseKeys.length === 0 ? (
          <p className="text-[13px] text-text-dim">No keys issued.</p>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="py-2 pr-4">Key</th>
                <th className="py-2 pr-4">Label</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Last used</th>
                <th className="py-2">Issued</th>
              </tr>
            </thead>
            <tbody>
              {user.licenseKeys.map((k) => (
                <tr key={k.id} className="border-t border-panel-2">
                  <td className="py-2 pr-4 font-mono text-[11.5px]">{k.key}</td>
                  <td className="py-2 pr-4">{k.label ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {k.active ? (
                      "active"
                    ) : (
                      <span className="text-muted">
                        revoked{k.revokedAt ? ` ${formatDate(k.revokedAt)}` : ""}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-text-dim">
                    {k.lastUsedAt ? formatDate(k.lastUsedAt) : "never"}
                  </td>
                  <td className="py-2 text-text-dim">{formatDate(k.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted">
            Invoice history ({invoices.length})
          </span>
          {sub?.stripeCustomerId && (
            <a
              className="ml-auto text-[11px] text-text-dim underline hover:no-underline"
              href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
              target="_blank"
              rel="noreferrer"
            >
              open in Stripe ↗
            </a>
          )}
        </div>
        {!sub?.stripeCustomerId ? (
          <p className="text-[13px] text-text-dim">No Stripe customer yet.</p>
        ) : invoices.length === 0 ? (
          <p className="text-[13px] text-text-dim">
            No invoices on record (or Stripe is unreachable).
          </p>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Links</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-panel-2">
                  <td className="py-2 pr-4 whitespace-nowrap text-text-dim">
                    {formatDate(new Date(inv.date))}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[11.5px]">
                    {inv.number ?? inv.id}
                  </td>
                  <td className="py-2 pr-4">{usd(inv.amount, { cents: true })}</td>
                  <td className="py-2 pr-4">
                    <span className="pill">{inv.status ?? "open"}</span>
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {inv.hostedUrl && (
                      <a
                        className="underline hover:no-underline"
                        href={inv.hostedUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        view
                      </a>
                    )}
                    {inv.hostedUrl && inv.pdfUrl && " · "}
                    {inv.pdfUrl && (
                      <a
                        className="underline hover:no-underline"
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        pdf
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted">
            Recent downloads
          </div>
          {user.downloads.length === 0 ? (
            <p className="text-[13px] text-text-dim">None yet.</p>
          ) : (
            <ul className="grid gap-1.5 text-[12.5px]">
              {user.downloads.map((d) => (
                <li key={d.id} className="flex justify-between gap-3">
                  <span>{d.chartId}</span>
                  <span className="whitespace-nowrap text-text-dim">
                    {formatDate(d.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted">
            Form history
          </div>
          {forms.length === 0 ? (
            <p className="text-[13px] text-text-dim">No submissions from this email.</p>
          ) : (
            <ul className="grid gap-1.5 text-[12.5px]">
              {forms.map((f) => (
                <li key={f.id} className="flex justify-between gap-3">
                  <Link
                    href={`/vz-ops-37/forms/${f.id}`}
                    className="underline hover:no-underline"
                  >
                    {f.form}
                    {f.message ? ` — ${f.message.slice(0, 48)}` : ""}
                  </Link>
                  <span className="whitespace-nowrap text-text-dim">
                    {formatDate(f.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
