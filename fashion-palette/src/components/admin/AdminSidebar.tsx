"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, FolderTree, Tag, Image, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: FolderTree, label: "Categories", href: "/admin/categories" },
  { icon: Tag, label: "Brands", href: "/admin/brands" },
  { icon: Image, label: "Banners", href: "/admin/banners" },
  { icon: Users, label: "Users", href: "/admin/users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-2.5 left-3 z-50 lg:hidden w-9 h-9 bg-white shadow-md rounded-lg flex items-center justify-center"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white transform transition-transform duration-300 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-bold">
            FASHION <span className="text-accent">PALETTE</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors",
                  isActive ? "bg-accent text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}
