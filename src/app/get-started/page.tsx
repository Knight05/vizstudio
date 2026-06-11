import ClientScripts from "@/components/ClientScripts";
import type { Metadata } from "next";
import { GetStartedForm } from "@/components/GetStartedForm";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Start your 14-day free trial of Viz Studio: 75+ premium D3 charts for Looker Studio. No credit card required. We'll email you a link to set your password.",
  alternates: { canonical: "https://vizstudio.io/get-started" },
  openGraph: {
    type: "website",
    url: "https://vizstudio.io/get-started",
    title: "Create your account | vizstudio",
    description:
      "Start your 14-day free trial of Viz Studio: 75+ premium D3 charts for Looker Studio. No credit card required.",
  },
};

export default function Page() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" key="l0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" key="l1" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" key="l2" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap"
        key="l3"
      />
      <link rel="stylesheet" href="/assets/style.css" key="l4" />
      <link rel="stylesheet" href="/assets/forms.css" key="l5" />

      {/* Form submit is handled in-React (GetStartedForm) - no external
          forms.js / get-started-3.js, which previously allowed a native GET
          submit that leaked field data into the URL. */}
      <GetStartedForm />

      {/* Nav/footer partials only. */}
      <ClientScripts srcs={["/assets/partials.js"]} />
    </>
  );
}
