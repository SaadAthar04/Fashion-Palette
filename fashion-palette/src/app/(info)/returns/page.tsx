import { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Fashion Palette returns and exchanges policy.",
};

// Feedback 25: dedicated Returns page. Wording is generic and safe.
// TODO(client): confirm exact return window, exclusions & who pays return shipping.
export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb items={[{ label: "Returns & Exchanges" }]} className="mb-6" />
      <h1 className="text-2xl md:text-3xl font-light tracking-tight">Returns &amp; Exchanges</h1>
      <div className="w-10 h-[1px] bg-accent mt-3 mb-8" />

      <div className="space-y-6 text-[14px] leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">Reporting an issue (48 hours)</h2>
          <p className="text-muted">
            Please inspect your order on delivery and report any defect, damage or wrong/mis-described item
            within <strong className="text-primary">48 hours of delivery</strong> (with photos/video). We do
            not offer change-of-mind returns. This does not affect any rights you have under applicable law.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">How returns differ by item type</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li><strong className="text-primary">Unstitched</strong> items must be returned uncut and unstitched.</li>
            <li><strong className="text-primary">Stitched / ready-to-wear</strong> items must be unworn with tags attached.</li>
            <li><strong className="text-primary">Made-to-order / custom-stitched</strong> items are generally non-returnable unless faulty.</li>
            <li><strong className="text-primary">Sale</strong> items may be final sale where indicated on the product page.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">Refunds</h2>
          <p className="text-muted">
            Once your return is received and inspected, an approved refund is processed to your original
            payment method or as store credit, typically within a few business days.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">Start a return</h2>
          <p className="text-muted">
            Contact us on WhatsApp at 0327-6796087 with your order number to start a return or exchange.
          </p>
        </section>
      </div>
    </div>
  );
}
