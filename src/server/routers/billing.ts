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
