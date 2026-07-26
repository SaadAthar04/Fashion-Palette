"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true); // response is intentionally generic (no account enumeration)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-2xl font-light tracking-tight text-center">Forgot password</h1>
      <div className="w-10 h-[1px] bg-accent mx-auto mt-3 mb-8" />

      {sent ? (
        <div className="text-center">
          <p className="text-sm">If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a reset link.</p>
          <p className="text-[13px] text-muted mt-2">Check your inbox (and spam) — the link expires in 60 minutes.</p>
          <Link href="/account/login" className="inline-block mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <p className="text-[13px] text-muted text-center">
            Enter your email and we&rsquo;ll send you a link to reset your password.
          </p>
          <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" isLoading={loading} className="w-full" size="lg">Send reset link</Button>
          <p className="text-center text-[13px] text-muted">
            <Link href="/account/login" className="text-accent hover:underline">Back to sign in</Link>
          </p>
        </form>
      )}
    </div>
  );
}
