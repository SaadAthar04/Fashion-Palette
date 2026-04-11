import { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Fashion Palette - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Privacy Policy" }]} className="mb-6" />

      <div className="max-w-3xl mx-auto prose">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted mb-6">Last updated: January 2024</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
        <p className="text-sm text-muted leading-relaxed">
          We collect information you provide directly: name, email, phone number, shipping address,
          and payment details when you place an order. We also collect browsing data including
          pages visited, device type, and IP address.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
        <p className="text-sm text-muted leading-relaxed">
          Your information is used to process orders, deliver products, send order updates, provide
          customer support, and improve our services. With your consent, we may send promotional
          emails about new collections and offers.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Data Protection</h2>
        <p className="text-sm text-muted leading-relaxed">
          We implement appropriate security measures to protect your personal information. Your
          password is encrypted, and we never share your payment details with third parties beyond
          what is necessary for payment processing.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Cookies</h2>
        <p className="text-sm text-muted leading-relaxed">
          We use cookies to enhance your browsing experience, remember your preferences, and analyze
          website traffic. You can disable cookies in your browser settings, but some features may
          not work properly.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Third-Party Services</h2>
        <p className="text-sm text-muted leading-relaxed">
          We may use third-party analytics and marketing tools (Google Analytics, Facebook Pixel)
          that collect anonymous usage data to help us improve our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Your Rights</h2>
        <p className="text-sm text-muted leading-relaxed">
          You can request access to, correction of, or deletion of your personal data at any time.
          You can also unsubscribe from marketing emails via the unsubscribe link in any email.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">Contact</h2>
        <p className="text-sm text-muted leading-relaxed">
          For privacy concerns, contact us at info@fashionpalette.pk or WhatsApp 0327-6796087.
        </p>
      </div>
    </div>
  );
}
