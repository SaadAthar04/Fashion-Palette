import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about shopping at Fashion Palette. Delivery, returns, payment methods, and more.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
