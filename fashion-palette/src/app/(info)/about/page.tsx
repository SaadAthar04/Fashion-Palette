import { Metadata } from "next";
import Image from "next/image";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "About Us",
  description: "Fashion Palette — Pakistan's multi-brand women's fashion destination.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "About Us" }]} className="mb-6" />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About Fashion Palette</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted leading-relaxed">
            <strong className="text-primary">Fashion Palette</strong> (fashionpalette.pk) is
            Pakistan&apos;s multi-brand women&apos;s fashion destination. We curate the finest collections
            from leading Pakistani designers and bring them to you with the convenience of online shopping.
          </p>

          <div className="my-8 aspect-[16/7] bg-surface relative overflow-hidden">
            <Image
              src="/images/placeholder/about-hero.jpg"
              alt="Fashion Palette Store"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
          <p className="text-muted leading-relaxed">
            We believe every woman deserves access to premium Pakistani fashion. Our mission is to make
            it easy to discover, explore, and shop the latest collections from leading Pakistani
            designers — all in one place.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {[
              { title: "100% Original", desc: "Products are sourced through verified and genuine retail channels." },
              { title: "Pakistan-Wide Delivery", desc: "We deliver to serviceable locations across Pakistan." },
              { title: "48-Hour Issue Window", desc: "Report any defect or wrong item within 48 hours of delivery." },
              { title: "Cash on Delivery", desc: "Pay with Cash on Delivery for eligible orders within Pakistan." },
            ].map((item) => (
              <div key={item.title} className="bg-surface p-6">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p className="text-muted leading-relaxed">
            Have questions? We&apos;re here to help! Reach us via WhatsApp at{" "}
            <strong>0327-6796087</strong> or email us at{" "}
            <a href="mailto:contact@fashionpalette.pk" className="text-accent hover:underline">
              contact@fashionpalette.pk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
