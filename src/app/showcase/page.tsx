import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShowcaseClient } from "./showcase-client";
import { loadManifest } from "@/lib/manifest";

export const metadata = { title: "Showcase" };

export default function ShowcasePage() {
  const manifest = loadManifest();
  return (
    <>
      <Navbar />
      <main>
        <ShowcaseClient
          components={manifest.components}
          totalCount={manifest.components.length}
        />
      </main>
      <Footer />
    </>
  );
}
