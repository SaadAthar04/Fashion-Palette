"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Feedback 26: the storefront chrome (top bar, header/nav, footer, WhatsApp
// widget) must not appear inside the admin panel. usePathname keeps this a
// client-side decision so storefront pages stay statically/ISR rendered.
export default function StorefrontChrome({
  topBar,
  header,
  footer,
  whatsapp,
  children,
}: {
  topBar: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  whatsapp: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }
  return (
    <>
      {topBar}
      {header}
      <main className="flex-1">{children}</main>
      {footer}
      {whatsapp}
    </>
  );
}
