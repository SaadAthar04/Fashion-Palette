import { Metadata } from "next";
import Image from "next/image";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "About Us",
  description: "Fashion Palette — Pakistan's premier multi-brand women's fashion destination since 2017.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "About Us" }]} className="mb-6" />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About Fashion Palette</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted leading-relaxed">
            Founded in 2017, <strong className="text-primary">Fashion Palette</strong> (fashionpalette.pk) is
            Pakistan&apos;s premier multi-brand women&apos;s fashion destination. We curate the finest collections
            from top Pakistani designers and bring them to you with the convenience of online shopping.
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
            it easy to discover, explore, and shop the latest collections from brands like Gul Ahmed,
            Khaadi, Sana Safinaz, Maria B, Sapphire, and many more — all in one place.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {[
              { title: "100% Authentic", desc: "Every product is sourced directly from authorized retailers and brands." },
              { title: "Pan-Pakistan Delivery", desc: "We deliver to every city and town across Pakistan." },
              { title: "48-Hour Issue Window", desc: "Report any defect or wrong item within 48 hours of delivery." },
              { title: "Secure Shopping", desc: "Cash on delivery and secure bank transfer options." },
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
            <a href="mailto:info@fashionpalette.pk" className="text-accent hover:underline">
              info@fashionpalette.pk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
