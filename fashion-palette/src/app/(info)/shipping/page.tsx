import { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_CHARGES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Fashion Palette shipping and delivery information.",
};

// Feedback 25: dedicated Shipping page. Known facts are accurate (Feedback 16).
// TODO(client): confirm delivery timelines & coverage before launch.
export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb items={[{ label: "Shipping & Delivery" }]} className="mb-6" />
      <h1 className="text-2xl md:text-3xl font-light tracking-tight">Shipping &amp; Delivery</h1>
      <div className="w-10 h-[1px] bg-accent mt-3 mb-8" />

      <div className="prose-sm space-y-6 text-[14px] leading-relaxed text-primary/90">
        <section>
          <h2 className="text-base font-semibold mb-2">Delivery charges</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>A flat delivery charge of <strong className="text-primary">{formatPrice(DEFAULT_DELIVERY_CHARGES)}</strong> applies to every order.</li>
            <li>Delivery is <strong className="text-primary">free</strong> on orders above {formatPrice(FREE_DELIVERY_THRESHOLD)}.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">Delivery timeline</h2>
          <p className="text-muted">
            Orders are typically dispatched within 1–2 working days and delivered within 3–5 working days
            across Pakistan, depending on your location and the courier.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">Tracking</h2>
          <p className="text-muted">
            Once your order ships, we&rsquo;ll email your courier and tracking number. You can also view order
            status any time in your account.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">Questions?</h2>
          <p className="text-muted">
            Contact us on WhatsApp at 0327-6796087 for any delivery queries.
          </p>
        </section>
      </div>
    </div>
  );
}
