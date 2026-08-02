"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mfaStep, setMfaStep] = useState(false); // staff email-OTP (Feedback 28)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Email-verification result (Feedback 21). Read from URL without Suspense.
    const v = new URLSearchParams(window.location.search).get("verified");
    if (v === "1") toast.success("Email verified — you can now sign in.");
    else if (v === "0") toast.error("That verification link is invalid or has expired.");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp: otp || undefined,
      });

      if (result?.error === "MFA_REQUIRED") {
        setMfaStep(true);
        toast.message("We emailed you a 6-digit login code. Enter it to continue.");
      } else if (result?.error === "MFA_INVALID") {
        toast.error("That code is invalid or expired. Please try again.");
      } else if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        // Honor where the user was headed (e.g. /admin via middleware callbackUrl).
        const cb = new URLSearchParams(window.location.search).get("callbackUrl");
        router.push(cb || "/account");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Account" }, { label: "Sign In" }]} className="mb-6" />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-muted text-center mb-8">Sign in to your Fashion Palette account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <div className="flex justify-end -mt-1">
            <Link href="/account/forgot-password" className="text-[12px] text-accent hover:text-accent-hover">
              Forgot password?
            </Link>
          </div>
          {mfaStep && (
            <Input
              label="Login code (emailed to you)"
              id="otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              autoFocus
              required
            />
          )}
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            {mfaStep ? "Verify & Sign In" : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/account/register" className="text-accent hover:text-accent-hover font-medium">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
