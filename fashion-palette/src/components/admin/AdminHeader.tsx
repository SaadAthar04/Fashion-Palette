"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ExternalLink, LogOut } from "lucide-react";

// Feedback 26: focused admin header — staff identity, View Store, logout.
// No storefront nav, cart, or WhatsApp widget here.
export default function AdminHeader() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const role = user?.role?.replace(/_/g, " ");

  return (
    <header className="h-14 flex items-center justify-between gap-4 px-4 md:px-6 bg-white border-b border-border sticky top-0 z-30 print:hidden">
      {/* leave room for the mobile sidebar toggle on small screens */}
      <span className="text-sm font-semibold pl-12 lg:pl-0">Admin Panel</span>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-accent transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Store</span>
        </Link>

        <div className="text-right hidden sm:block leading-tight">
          <p className="text-[12px] font-medium truncate max-w-[160px]">
            {user?.name || user?.email || "Staff"}
          </p>
          {role && <p className="text-[10px] text-muted capitalize">{role}</p>}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-red-600 transition-colors"
          aria-label="Log out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
