import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up" };
// AuthForm uses useSearchParams() — needs dynamic rendering
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-20">
        <AuthForm mode="signup" />
      </main>
      <Footer />
    </>
  );
}
