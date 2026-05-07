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
