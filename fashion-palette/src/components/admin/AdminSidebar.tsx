"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Package, ShoppingCart, RotateCcw, FolderTree, Layers, Tag, Ticket, Star, Image, Users, BarChart3, Mail, Send, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Feedback 27: show a link only to roles that can use it (least privilege).
const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", roles: ["admin", "order_manager", "catalogue_editor"] },
  { icon: Package, label: "Products", href: "/admin/products", roles: ["admin", "catalogue_editor"] },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders", roles: ["admin", "order_manager"] },
  { icon: RotateCcw, label: "Returns", href: "/admin/returns", roles: ["admin", "order_manager"] },
  { icon: FolderTree, label: "Categories", href: "/admin/categories", roles: ["admin", "catalogue_editor"] },
  { icon: Layers, label: "Collections", href: "/admin/collections", roles: ["admin", "catalogue_editor"] },
  { icon: Tag, label: "Brands", href: "/admin/brands", roles: ["admin", "catalogue_editor"] },
  { icon: Ticket, label: "Coupons", href: "/admin/coupons", roles: ["admin"] },
  { icon: Star, label: "Reviews", href: "/admin/reviews", roles: ["admin", "catalogue_editor"] },
  { icon: Image, label: "Banners", href: "/admin/banners", roles: ["admin", "catalogue_editor"] },
  { icon: BarChart3, label: "Reports", href: "/admin/reports", roles: ["admin", "order_manager"] },
  { icon: Mail, label: "Email Log", href: "/admin/emails", roles: ["admin"] },
  { icon: Send, label: "Newsletter", href: "/admin/newsletter", roles: ["admin"] },
  { icon: Users, label: "Users", href: "/admin/users", roles: ["admin"] },
  { icon: Settings, label: "Settings", href: "/admin/settings", roles: ["admin"] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "admin";
  const links = sidebarLinks.filter((l) => l.roles.includes(role));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-2.5 left-3 z-50 lg:hidden w-9 h-9 bg-white shadow-md rounded-lg flex items-center justify-center print:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white transform transition-transform duration-300 lg:translate-x-0 lg:static print:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-bold">
            FASHION <span className="text-accent">PALETTE</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => {
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
