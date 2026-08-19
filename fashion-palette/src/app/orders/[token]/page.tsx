import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { orders, orderStatusHistory } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyOrderToken } from "@/lib/guest-token";
import { formatPrice, getImageUrl, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { courierLabel } from "@/lib/courier";
import GuestOrderCancel from "@/components/order/GuestOrderCancel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Order", robots: { index: false, follow: false } };

export default async function GuestOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const orderId = verifyOrderToken(token);

  if (!orderId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-3">Link expired or invalid</h1>
        <p className="text-muted text-sm mb-6">
          This order link is no longer valid. Please use the most recent link from your order email, or contact us on WhatsApp
          0327-6796087 with your order number.
        </p>
        <Link href="/" className="text-accent text-sm font-medium">← Back to shop</Link>
      </div>
    );
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true, statusHistory: { orderBy: [asc(orderStatusHistory.createdAt)] } },
  });
  if (!order) notFound();

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const addr = order.shippingAddressJson as Record<string, string>;
  const canCancel = order.status === "pending";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
        <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full", statusInfo?.color)}>
          {statusInfo?.label || order.status}
        </span>
      </div>
      <p className="text-sm text-muted mb-6">
        Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      {/* Status guidance */}
      <div className="mb-6 text-sm">
        {order.status === "pending" && (
          <p className="text-muted">We&apos;ve received your order request. It is not accepted yet — you can still cancel it below.</p>
        )}
        {["confirmed", "processing"].includes(order.status) && (
          <p className="text-muted">Your order has been accepted and fulfilment has started, so it can no longer be cancelled here.</p>
        )}
        {order.status === "shipped" && (
          <p className="text-muted">Your order has shipped. Use the tracking details below to follow your parcel.</p>
        )}
        {isCancelled && <p className="text-sale font-medium">This order has been cancelled.</p>}
      </div>

      {/* Items */}
      <div className="border border-border rounded-lg overflow-hidden mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <div className="w-14 bg-surface relative overflow-hidden rounded flex-shrink-0" style={{ height: 72 }}>
              <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="56px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.productName}</p>
              <p className="text-xs text-muted mt-0.5">
                {[item.articleCode && `Code: ${item.articleCode}`, item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`].filter(Boolean).join(" · ")}
              </p>
              <p className="text-xs text-muted">Qty {item.quantity} × {formatPrice(item.unitPrice)}</p>
            </div>
            <p className="font-semibold text-sm whitespace-nowrap">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
        <div className="p-4 space-y-2 text-sm bg-surface/40">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{parseFloat(order.deliveryCharges) === 0 ? "FREE" : formatPrice(order.deliveryCharges)}</span></div>
          {parseFloat(order.discountAmount) > 0 && (
            <div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-sale">-{formatPrice(order.discountAmount)}</span></div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Delivery address</p>
          <div className="text-muted space-y-0.5">
            <p className="text-primary font-medium">{addr?.fullName}</p>
            <p>{addr?.addressLine1}</p>
            {addr?.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>{addr?.city}, {addr?.province}</p>
            {addr?.postalCode && <p>{addr.postalCode}</p>}
            <p>{addr?.phone}</p>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Payment</p>
          <p className="text-muted">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
          {order.status === "shipped" && (order.trackingNumber || order.courier) && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Tracking</p>
              {order.courier && <p className="text-muted">{courierLabel(order.courier)}</p>}
              {order.trackingNumber && <p className="text-muted">#{order.trackingNumber}</p>}
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-accent font-medium inline-block mt-1">Track shipment →</a>
              )}
            </div>
          )}
        </div>
      </div>

      {canCancel && <GuestOrderCancel token={token} />}
    </div>
  );
}
