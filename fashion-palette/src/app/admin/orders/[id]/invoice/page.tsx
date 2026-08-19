import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { CONTACT } from "@/lib/constants";
import InvoiceActions from "@/components/admin/InvoiceActions";

export const dynamic = "force-dynamic";

// Feedback 19: printable invoice / packing slip.
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, parseInt(id)),
    with: { user: true, items: true },
  });
  if (!order) notFound();

  const addr = order.shippingAddressJson as Record<string, string>;
  const placed = new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-3xl mx-auto">
      <InvoiceActions />

      <div className="invoice-sheet bg-white p-8 md:p-10 rounded-lg shadow-sm print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-border">
          <div>
            <p className="text-lg font-bold tracking-[0.15em] uppercase">
              Fashion <span className="text-accent">Palette</span>
            </p>
            <p className="text-xs text-muted mt-1 max-w-[220px]">{CONTACT.location}</p>
            <p className="text-xs text-muted">WhatsApp {CONTACT.whatsappDisplay} · {CONTACT.emails.orders}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">INVOICE</p>
            <p className="text-sm">{order.orderNumber}</p>
            <p className="text-xs text-muted mt-1">Placed {placed}</p>
            <p className="text-xs text-muted">Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
          </div>
        </div>

        {/* Bill / ship to */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Ship to</p>
            <p className="text-sm font-medium">{addr?.fullName}</p>
            <p className="text-sm text-muted">{addr?.addressLine1}{addr?.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
            <p className="text-sm text-muted">{addr?.city}, {addr?.province} {addr?.postalCode || ""}</p>
            <p className="text-sm text-muted">{addr?.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Contact</p>
            <p className="text-sm text-muted">{order.user?.email || order.guestEmail}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left">
              <th className="py-2.5 font-semibold">Item</th>
              <th className="py-2.5 font-semibold text-center">Qty</th>
              <th className="py-2.5 font-semibold text-right">Price</th>
              <th className="py-2.5 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-b border-border/60">
                <td className="py-2.5">{it.productName}{[it.size, it.color].filter(Boolean).length ? ` (${[it.size, it.color].filter(Boolean).join(", ")})` : ""}</td>
                <td className="py-2.5 text-center">{it.quantity}</td>
                <td className="py-2.5 text-right">{formatPrice(it.unitPrice)}</td>
                <td className="py-2.5 text-right">{formatPrice(it.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-64 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {parseFloat(order.discountAmount) > 0 && <Row label="Discount" value={`- ${formatPrice(order.discountAmount)}`} />}
            <Row label="Delivery" value={parseFloat(order.deliveryCharges) === 0 ? "FREE" : formatPrice(order.deliveryCharges)} />
            <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted mt-10 pt-6 border-t border-border">
          Thank you for shopping with Fashion Palette. Report any issue within 48 hours of delivery to {CONTACT.emails.support}.
          Prices in PKR.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
