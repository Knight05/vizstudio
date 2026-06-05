import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-20">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </>
  );
}
