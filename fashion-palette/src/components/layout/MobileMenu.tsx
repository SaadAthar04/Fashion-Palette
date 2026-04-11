"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Heart, Package, ChevronRight } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { data: session } = useSession();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Menu" side="left">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 pb-4 border-b border-border/30">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase">
            Fashion <span className="text-accent">Palette</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-6 py-4 text-[12px] font-medium uppercase tracking-[0.15em] hover:bg-surface transition-colors duration-300",
                "isHighlighted" in link && link.isHighlighted && "text-sale"
              )}
            >
              {link.label}
              <ChevronRight className="w-3.5 h-3.5 text-muted/40" strokeWidth={1.5} />
            </Link>
          ))}
        </nav>

        {/* Account Section */}
        <div className="border-t border-border/30 py-5 px-6 space-y-3">
          {session ? (
            <>
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 bg-surface flex items-center justify-center">
                  <User className="w-4 h-4 text-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium">
                    {session.user?.name}
                  </p>
                  <p className="text-[11px] text-muted">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center gap-3 py-2.5 text-[12px] tracking-wide hover:text-accent transition-colors duration-300"
              >
                <Package className="w-4 h-4" strokeWidth={1.5} /> My Orders
              </Link>
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 py-2.5 text-[12px] tracking-wide hover:text-accent transition-colors duration-300"
              >
                <Heart className="w-4 h-4" strokeWidth={1.5} /> Wishlist
              </Link>
              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="flex items-center gap-3 py-2.5 text-[12px] tracking-wide text-sale hover:opacity-80 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/account/login"
                onClick={onClose}
                className="flex-1 text-center py-3 text-[10px] font-semibold uppercase tracking-[0.18em] bg-primary text-white hover:bg-primary/90 transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/account/register"
                onClick={onClose}
                className="flex-1 text-center py-3 text-[10px] font-semibold uppercase tracking-[0.18em] border border-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
