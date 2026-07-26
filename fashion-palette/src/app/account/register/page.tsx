"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.phone && !/^03\d{9}$/.test(formData.phone)) newErrors.phone = "Enter a valid phone (03XXXXXXXXX)";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Account created! Check your email to verify, then sign in.");
      router.push("/account/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Account" }, { label: "Create Account" }]} className="mb-6" />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-muted text-center mb-8">Join Fashion Palette</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} error={errors.name} placeholder="Your full name" required />
          <Input label="Email Address" id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} error={errors.email} placeholder="you@example.com" required />
          <Input label="Phone Number (Optional)" id="phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} error={errors.phone} placeholder="03XXXXXXXXX" />
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-3 border border-border text-sm focus:outline-none focus:border-accent pr-11"
                required
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[12px] text-sale mt-1.5">{errors.password}</p>}
            <p className="text-[11px] text-muted mt-2">Use 8+ characters with a mix of letters and numbers.</p>
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-sm text-center text-muted mt-6">
          Already have an account?{" "}
          <Link href="/account/login" className="text-accent hover:text-accent-hover font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
