import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Start free" };

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
