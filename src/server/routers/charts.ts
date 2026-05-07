import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { loadManifest, getChartBySlug } from "@/lib/manifest";
import { TRPCError } from "@trpc/server";

export const chartsRouter = router({
  /** Return the full manifest for showcase / catalog pages. */
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const manifest = loadManifest();
      let components = manifest.components;

      if (input?.category) {
        components = components.filter((c) => c.category === input.category);
      }
      if (input?.search) {
        const q = input.search.toLowerCase();
        components = components.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.shortDescription.toLowerCase().includes(q) ||
            c.tags.some((t) => t.includes(q)),
        );
      }
      return { ...manifest, components };
    }),

  /** Get a single chart by slug. */
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const chart = getChartBySlug(input.slug);
      if (!chart) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chart not found" });
      }
      return chart;
    }),

  /** Toggle favorite (auth-required). */
  toggleFavorite: protectedProcedure
    .input(z.object({ chartId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.favorite.findUnique({
        where: {
          userId_chartId: {
            userId: ctx.user.id,
            chartId: input.chartId,
          },
        },
      });
      if (existing) {
        await ctx.prisma.favorite.delete({ where: { id: existing.id } });
        return { favorited: false };
      }
      await ctx.prisma.favorite.create({
        data: { userId: ctx.user.id, chartId: input.chartId },
      });
      return { favorited: true };
    }),

  /** Record a download. Usable by anyone (guest or authed). */
  recordDownload: publicProcedure
    .input(z.object({ chartId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.download.create({
        data: {
          chartId: input.chartId,
          userId: ctx.user?.id ?? null,
          ip: ctx.headers.get("x-forwarded-for") ?? undefined,
          userAgent: ctx.headers.get("user-agent") ?? undefined,
        },
      });
      return { ok: true };
    }),
});
