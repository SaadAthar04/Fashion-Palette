import { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping at Fashion Palette.",
};

export default function TermsPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Terms & Conditions" }]} className="mb-6" />

      <div className="max-w-3xl mx-auto prose">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted mb-6">Last updated: January 2024</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">1. General</h2>
        <p className="text-sm text-muted leading-relaxed">
          By using fashionpalette.pk, you agree to these terms and conditions. Fashion Palette reserves
          the right to modify these terms at any time. Your continued use of the website constitutes
          acceptance of any changes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. Products</h2>
        <p className="text-sm text-muted leading-relaxed">
          All products on our website are subject to availability. We make every effort to display
          colors accurately, but slight variations may occur due to screen settings. Product prices
          are listed in Pakistani Rupees (PKR) and include applicable taxes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Orders</h2>
        <p className="text-sm text-muted leading-relaxed">
          An order is confirmed once you receive an order confirmation via email or SMS. We reserve
          the right to cancel orders due to stock unavailability, pricing errors, or suspected fraud.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Payment</h2>
        <p className="text-sm text-muted leading-relaxed">
          We accept Cash on Delivery (COD), bank transfer, JazzCash, and EasyPaisa. All COD orders
          require payment upon delivery.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Shipping & Delivery</h2>
        <p className="text-sm text-muted leading-relaxed">
          Standard delivery takes 3-7 business days. Free delivery on orders above Rs. 5,000.
          Delivery charges of Rs. 200 apply for orders below this threshold.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Returns & Refunds</h2>
        <p className="text-sm text-muted leading-relaxed">
          Returns are accepted within 7 days of delivery. Items must be unused, unworn, and in original
          packaging. Refunds are processed within 5-7 business days. Sale items may have different
          return policies as noted on the product page.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Contact</h2>
        <p className="text-sm text-muted leading-relaxed">
          For questions about these terms, contact us at info@fashionpalette.pk or WhatsApp 0327-6796087.
        </p>
      </div>
    </div>
  );
}
