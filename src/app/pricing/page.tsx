import { headers } from "next/headers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingCards } from "@/components/PricingCards";
import { FAQ } from "@/components/FAQ";
import { auth } from "@/lib/auth";

export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <Navbar />
      <main>
        <div className="mx-auto max-w-page px-6 pt-20 pb-6 text-center">
          <h1 className="font-sans text-4xl md:text-5xl font-semibold tracking-tight max-w-[20ch] mx-auto">
            One price. Every chart. Forever.
          </h1>
          <p className="mt-4 text-[14px] text-text-dim max-w-[54ch] mx-auto font-sans">
            We don't gate charts by tier. Pay for seats and support speed — unlock
            the whole library on day one.
          </p>
        </div>
        <PricingCards isAuthed={!!session?.user} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
