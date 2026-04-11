"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Account created! Please sign in.");
      router.push("/account/login");
    } catch {
      toast.error("Registration failed. Please try again.");
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
        <p className="text-muted text-center mb-8">Join Fashion Palette for exclusive deals</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} error={errors.name} placeholder="Your full name" required />
          <Input label="Email Address" id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} error={errors.email} placeholder="you@example.com" required />
          <Input label="Phone Number (Optional)" id="phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="03XXXXXXXXX" />
          <Input label="Password" id="password" type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} error={errors.password} placeholder="Min 6 characters" required />
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
