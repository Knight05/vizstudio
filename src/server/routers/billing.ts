import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { stripe } from "@/lib/stripe";
import { TRPCError } from "@trpc/server";

const PRICE_MAP = {
  PRO_MONTHLY:  process.env.STRIPE_PRICE_PRO_MONTHLY!,
  PRO_YEARLY:   process.env.STRIPE_PRICE_PRO_YEARLY!,
  TEAM_MONTHLY: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
  TEAM_YEARLY:  process.env.STRIPE_PRICE_TEAM_YEARLY!,
} as const;

export const billingRouter = router({
  /** Create a Stripe Checkout session for the chosen plan. */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum([
          "PRO_MONTHLY",
          "PRO_YEARLY",
          "TEAM_MONTHLY",
          "TEAM_YEARLY",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const priceId = PRICE_MAP[input.plan];
      if (!priceId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Stripe price not configured",
        });
      }

      const sub = await ctx.prisma.subscription.findUnique({
        where: { userId: ctx.user.id },
      });

      // Reuse customer id if we already created one.
      let customerId = sub?.stripeCustomerId ?? undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email,
          metadata: { userId: ctx.user.id },
        });
        customerId = customer.id;
        await ctx.prisma.subscription.upsert({
          where: { userId: ctx.user.id },
          create: { userId: ctx.user.id, stripeCustomerId: customerId },
          update: { stripeCustomerId: customerId },
        });
      }

      const origin = process.env.NEXT_PUBLIC_APP_URL!;
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/pricing?checkout=cancelled`,
        subscription_data: {
          metadata: { userId: ctx.user.id },
        },
      });

      return { url: session.url };
    }),

  /** Invoice history for the client portal. */
  invoices: protectedProcedure.query(async ({ ctx }) => {
    const sub = await ctx.prisma.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!sub?.stripeCustomerId) return [];

    try {
      const invoices = await stripe.invoices.list({
        customer: sub.stripeCustomerId,
        limit: 24,
      });
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
      // Stripe unreachable / misconfigured - show empty history, not an error.
      return [];
    }
  }),

  /** The default card on file, for display in the billing tab. */
  paymentMethod: protectedProcedure.query(async ({ ctx }) => {
    const sub = await ctx.prisma.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!sub?.stripeCustomerId) return null;

    try {
      const customer = await stripe.customers.retrieve(sub.stripeCustomerId, {
        expand: ["invoice_settings.default_payment_method"],
      });
      if (customer.deleted) return null;

      let pm = customer.invoice_settings?.default_payment_method;
      // Fall back to the most recent card if no explicit default is set.
      if (!pm || typeof pm === "string") {
        const list = await stripe.paymentMethods.list({
          customer: sub.stripeCustomerId,
          type: "card",
          limit: 1,
        });
        pm = list.data[0];
      }
      if (!pm || typeof pm === "string" || !pm.card) return null;

      return {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      };
    } catch {
      return null;
    }
  }),

  /** Open the Stripe billing portal. */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const sub = await ctx.prisma.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!sub?.stripeCustomerId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No active Stripe customer",
      });
    }
    const origin = process.env.NEXT_PUBLIC_APP_URL!;
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });
    return { url: portal.url };
  }),
});
