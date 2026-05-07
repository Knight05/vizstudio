import { headers } from "next/headers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { ChartStrip } from "@/components/ChartStrip";
import { PricingCards } from "@/components/PricingCards";
import { FAQ } from "@/components/FAQ";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <ChartStrip />
        <PricingCards isAuthed={!!session?.user} />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="guides absolute inset-0 opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-page px-6 py-24 text-center">
        <h2 className="font-sans text-3xl md:text-5xl font-semibold tracking-tight max-w-[20ch] mx-auto">
          Ship reports your team actually reads.
        </h2>
        <p className="mt-4 text-[14px] text-text-dim max-w-[50ch] mx-auto font-sans">
          Start a free 14-day trial. No credit card. Cancel anytime.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="/signup" className="btn btn-primary !text-[14px] !py-3 !px-6">
            Start free trial →
          </a>
          <a href="/showcase" className="btn !text-[14px] !py-3 !px-6">
            See the library
          </a>
        </div>
      </div>
    </section>
  );
}
