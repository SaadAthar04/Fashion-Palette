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

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fashion Palette — Pakistan's Premier Multi-Brand Fashion Destination",
    template: "%s | Fashion Palette",
  },
  description:
    "Shop the latest Pakistani women's fashion from top designers. Unstitched, Ready to Wear, Luxury & Festive collections. Free delivery on orders above Rs. 5,000.",
  keywords: [
    "Pakistani fashion",
    "women's clothing",
    "unstitched suits",
    "ready to wear",
    "luxury fashion",
    "Gul Ahmed",
    "Khaadi",
    "Maria B",
    "Sana Safinaz",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <TopBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
