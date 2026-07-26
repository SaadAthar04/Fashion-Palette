"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reset password.");
      toast.success("Password reset. Please sign in.");
      router.push("/account/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm">This reset link is invalid.</p>
        <Link href="/account/forgot-password" className="inline-block mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-[13px] text-muted text-center">Choose a new password (at least 8 characters).</p>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2">New Password</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-border text-sm focus:outline-none focus:border-accent pr-11"
            required
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-muted mt-2">Use 8+ characters with a mix of letters and numbers.</p>
      </div>
      <Button type="submit" isLoading={loading} className="w-full" size="lg">Reset password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-2xl font-light tracking-tight text-center">Reset password</h1>
      <div className="w-10 h-[1px] bg-accent mx-auto mt-3 mb-8" />
      <Suspense fallback={<p className="text-center text-sm text-muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
