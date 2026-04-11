"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Package, Heart, MapPin, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";

const quickLinks = [
  { icon: Package, label: "My Orders", href: "/account/orders", desc: "Track and manage your orders" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist", desc: "Your saved items" },
  { icon: MapPin, label: "Addresses", href: "/account/addresses", desc: "Manage delivery addresses" },
  { icon: User, label: "Profile", href: "/account/profile", desc: "Edit your details" },
];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/account/login");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "My Account" }]} className="mb-6" />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {session.user?.name}</h1>
            <p className="text-muted text-sm mt-1">{session.user?.email}</p>
          </div>
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })} className="text-sm">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.label} href={link.href} className="flex items-start gap-4 p-5 border border-border hover:border-accent hover:shadow-sm transition-all group">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                <link.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold group-hover:text-accent transition-colors">{link.label}</h3>
                <p className="text-xs text-muted mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
