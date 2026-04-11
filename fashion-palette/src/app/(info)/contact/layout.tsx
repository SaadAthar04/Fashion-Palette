import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Fashion Palette. WhatsApp, email, or visit us. We're here to help with your fashion queries.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
