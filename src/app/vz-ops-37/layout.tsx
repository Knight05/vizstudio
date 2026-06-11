import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-page px-6 py-10">
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-semibold tracking-tight">
            Admin
          </h1>
          <nav className="mt-4 flex gap-2 text-[13px]">
            <Link href="/vz-ops-37" className="pill hover:bg-panel-2">
              Overview
            </Link>
            <Link href="/vz-ops-37/clients" className="pill hover:bg-panel-2">
              Clients
            </Link>
            <Link href="/vz-ops-37/forms" className="pill hover:bg-panel-2">
              Forms
            </Link>
            <Link href="/vz-ops-37/content" className="pill hover:bg-panel-2">
              Content
            </Link>
          </nav>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
