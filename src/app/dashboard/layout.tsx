import { AppFonts } from "@/components/AppFonts";
import { TRPCProvider } from "@/trpc/provider";

/**
 * The tRPC client (+ React Query + superjson) is only used by
 * `dashboard/portal-client.tsx`. It used to be mounted in the root layout,
 * which shipped the whole client stack — ~200 KiB of unused JavaScript — to
 * every static marketing page. Scope it to the one route tree that needs it.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppFonts />
      <TRPCProvider>{children}</TRPCProvider>
    </>
  );
}
