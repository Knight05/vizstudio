import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { generateLicenseKey } from "@/lib/utils";

export const userRouter = router({
  /** Fetch the current user + subscription + keys + favorites. */
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        subscription: true,
        licenseKeys: {
          where: { revokedAt: null },
          orderBy: { createdAt: "asc" },
        },
        favorites: true,
      },
    });
  }),

  /** Download history for the client portal. */
  downloads: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.download.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, chartId: true, createdAt: true },
    });
  }),

  /** Update display name. */
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().trim().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { name: input.name },
        select: { id: true, name: true },
      });
    }),

  /** Support / chart request - lands in the admin forms inbox. */
  submitSupport: protectedProcedure
    .input(
      z.object({
        topic: z.enum(["support", "billing", "chart-request", "bug"]),
        message: z.string().trim().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.formSubmission.create({
        data: {
          form: "support",
          email: ctx.user.email,
          name: ctx.user.name ?? null,
          message: input.message,
          source: `portal:${input.topic}`,
        },
      });
      return { ok: true };
    }),

  /** Issue a new license key (Pro/Team only). */
  createLicenseKey: protectedProcedure
    .input(z.object({ label: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await ctx.prisma.subscription.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!sub || (sub.tier !== "PRO" && sub.tier !== "TEAM")) {
        throw new Error("License keys require a Pro or Team plan");
      }
      const maxKeys = sub.tier === "TEAM" ? 10 : 2;
      const count = await ctx.prisma.licenseKey.count({
        where: { userId: ctx.user.id, revokedAt: null },
      });
      if (count >= maxKeys) {
        throw new Error(`Plan limit reached (${maxKeys} keys)`);
      }
      return ctx.prisma.licenseKey.create({
        data: {
          userId: ctx.user.id,
          key: generateLicenseKey(),
          label: input.label,
        },
      });
    }),

  /** Revoke a license key. */
  revokeLicenseKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.licenseKey.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { revokedAt: new Date(), active: false },
      });
    }),
});
