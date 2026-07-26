import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fashion Palette — Multi-Brand Women's Fashion",
    template: "%s | Fashion Palette",
  },
  description:
    "Shop women's fashion from leading Pakistani designers. Unstitched, Prints, Embroidered & Festive collections. Free delivery on orders above Rs. 10,000.",
  keywords: [
    "Pakistani fashion",
    "women's clothing",
    "unstitched suits",
    "prints",
    "embroidered",
    "Maria B",
    "Elan",
    "Zara Shahjahan",
    "Afrozeh",
    "Mushq",
    "online shopping Pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Fashion Palette",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "Fashion Palette" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Active brands for the header mega menu (Feedback 01), alphabetical.
  const menuBrands = await db
    .select({ id: brands.id, name: brands.name, slug: brands.slug })
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(brands.name);

  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <TopBar />
          <Header brands={menuBrands} />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
