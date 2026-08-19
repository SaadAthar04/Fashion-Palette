"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import MobileMenu from "./MobileMenu";
import SearchModal from "./SearchModal";
import CartDrawer from "./CartDrawer";

export type MenuBrand = { id: number; name: string; slug: string };

export default function Header({ brands = [] }: { brands?: MenuBrand[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { data: session } = useSession();
  const { isOpen: cartOpen, openCart, closeCart, getItemCount } = useCart();
  // Final feedback A6: avoid a hydration mismatch (and the resulting signed-in /
  // signed-out flicker). The cart count comes from a localStorage-backed store
  // and the session resolves client-side, so both are empty during SSR. Render
  // the neutral (server) state until mounted, then reveal the real state.
  const [mounted, setMounted] = useState(false);
  const itemCount = mounted ? getItemCount() : 0;
  const isSignedIn = mounted && !!session;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 bg-white/95 backdrop-blur-md transition-all duration-500",
          isScrolled && "shadow-[0_1px_0_rgba(0,0,0,0.06)]"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] md:h-[72px]">
            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:text-accent transition-colors duration-300"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Logo — monogram emblem + wordmark */}
            <Link href="/" className="flex-shrink-0 group flex items-center gap-2.5" aria-label="Fashion Palette — home">
              <Image
                src="/images/logo.png"
                alt="Fashion Palette"
                width={40}
                height={40}
                priority
                className="w-8 h-8 md:w-9 md:h-9"
              />
              <span className="text-lg md:text-xl font-semibold tracking-[0.2em] uppercase leading-none">
                <span className="text-primary transition-colors duration-300">Fashion</span>
                <span className="text-accent transition-colors duration-300"> Palette</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => {
                const hasMega = "hasMegaMenu" in link && link.hasMegaMenu;
                const linkClass = cn(
                  "text-[11px] font-medium tracking-[0.18em] uppercase text-primary/80 hover:text-accent transition-colors duration-300 relative py-1",
                  "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-accent after:transition-all after:duration-500 hover:after:w-full"
                );
                if (hasMega) {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setMegaOpen(true)}
                      onMouseLeave={() => setMegaOpen(false)}
                    >
                      <Link href={link.href} className={linkClass} aria-haspopup="true" aria-expanded={megaOpen}>
                        {link.label}
                      </Link>
                    </div>
                  );
                }
                return (
                  <Link key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 md:gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-primary/70 hover:text-accent transition-colors duration-300"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              <Link
                href={isSignedIn ? "/account" : "/account/login"}
                className="hidden md:flex p-2.5 text-primary/70 hover:text-accent transition-colors duration-300"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              <Link
                href="/account/wishlist"
                className="hidden md:flex p-2.5 text-primary/70 hover:text-accent transition-colors duration-300"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              <button
                onClick={openCart}
                className="p-2.5 text-primary/70 hover:text-accent transition-colors duration-300 relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Brands mega menu (desktop) */}
        {megaOpen && brands.length > 0 && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-border shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)] animate-fade-in-down"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Shop by Brand
                </span>
                <Link
                  href="/brands"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover"
                >
                  View all brands →
                </Link>
              </div>
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-2.5">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/brands/${b.slug}`}
                    className="text-[13px] text-primary/80 hover:text-accent transition-colors py-1"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subtle bottom border */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        brands={brands}
      />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </>
  );
}
