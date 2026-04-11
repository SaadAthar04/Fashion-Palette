"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/account/login");
    }
  }, [status, session, router]);

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
          { label: "Addresses" },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
          Saved Addresses
        </h1>
      </div>

      <div className="text-center py-20 border border-border">
        <MapPin className="w-12 h-12 text-accent mx-auto mb-5 stroke-[1.5]" />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2">
          No saved addresses
        </h2>
        <p className="text-[13px] text-muted mb-8 max-w-sm mx-auto">
          Add a delivery address for faster checkout.
        </p>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>
    </div>
  );
}
