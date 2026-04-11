"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";

export default function WishlistPage() {
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
          { label: "Wishlist" },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-8">
        My Wishlist
      </h1>

      <div className="text-center py-20 border border-border">
        <Heart className="w-12 h-12 text-accent mx-auto mb-5 stroke-[1.5]" />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-[13px] text-muted mb-8 max-w-sm mx-auto">
          Save the pieces you love and come back to them anytime.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            Start Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
