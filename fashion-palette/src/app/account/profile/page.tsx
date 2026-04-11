"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/account/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement profile update API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb
        items={[
          { label: "Account", href: "/account" },
          { label: "Profile" },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-8">
        Edit Profile
      </h1>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />

          <div className="w-full">
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 border border-border/50 text-[13px] text-muted bg-surface cursor-not-allowed"
            />
            <p className="mt-1.5 text-[11px] text-muted">
              Email cannot be changed
            </p>
          </div>

          <Input
            label="Phone Number"
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
          />

          <div className="pt-4">
            <Button type="submit" isLoading={isSaving} size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
