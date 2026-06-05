import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin" };
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
            <Link href="/admin" className="pill hover:bg-panel-2">
              Overview
            </Link>
            <Link href="/admin/clients" className="pill hover:bg-panel-2">
              Clients
            </Link>
            <Link href="/admin/forms" className="pill hover:bg-panel-2">
              Forms
            </Link>
          </nav>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
