import { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Payment",
  description: "Payment methods accepted at Fashion Palette.",
};

// Feedback 25/17: dedicated Payment page — only lists methods that actually launch.
// TODO(client): add JazzCash/EasyPaisa/bank details once those methods go live.
export default function PaymentPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb items={[{ label: "Payment" }]} className="mb-6" />
      <h1 className="text-2xl md:text-3xl font-light tracking-tight">Payment</h1>
      <div className="w-10 h-[1px] bg-accent mt-3 mb-8" />

      <div className="space-y-6 text-[14px] leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">Accepted payment methods</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li><strong className="text-primary">Cash on Delivery (COD)</strong> — pay in cash when your order arrives.</li>
          </ul>
          <p className="text-muted mt-3">
            Additional payment options may be added in future. Only methods shown at checkout are currently available.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2">Security</h2>
          <p className="text-muted">
            We never store card details on our website. Prices and totals are always confirmed on our
            server before your order is placed.
          </p>
        </section>
      </div>
    </div>
  );
}
