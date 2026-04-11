"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import MobileMenu from "./MobileMenu";
import SearchModal from "./SearchModal";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();
  const { isOpen: cartOpen, openCart, closeCart, getItemCount } = useCart();
  const itemCount = getItemCount();

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

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <h1 className="text-lg md:text-xl font-semibold tracking-[0.2em] uppercase">
                <span className="text-primary transition-colors duration-300">Fashion</span>
                <span className="text-accent transition-colors duration-300"> Palette</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-medium tracking-[0.18em] uppercase text-primary/80 hover:text-accent transition-colors duration-300 relative py-1",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-accent after:transition-all after:duration-500 hover:after:w-full",
                    "isHighlighted" in link &&
                      link.isHighlighted &&
                      "text-sale font-semibold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
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
                href={session ? "/account" : "/account/login"}
                className="hidden md:flex p-2.5 text-primary/70 hover:text-accent transition-colors duration-300"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              <Link
                href="/account"
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

        {/* Subtle bottom border */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </>
  );
}
