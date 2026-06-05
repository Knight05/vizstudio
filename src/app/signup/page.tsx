import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Start free" };
// AuthForm uses useSearchParams() — needs dynamic rendering
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0b14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Link
        href="/"
        style={{
          marginBottom: 28,
          fontSize: 15,
          fontWeight: 700,
          color: "#e7e9f5",
          textDecoration: "none",
          letterSpacing: "-0.01em",
        }}
      >
        ✦ vizstudio
      </Link>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <Link href="/" style={{ marginTop: 26, fontSize: 12.5, color: "#9aa1c0", textDecoration: "none" }}>
        ← Back to vizstudio.io
      </Link>
    </main>
  );
}
