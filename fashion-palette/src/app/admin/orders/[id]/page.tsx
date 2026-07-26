import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { orders, orderStatusHistory } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { formatPrice, cn, getImageUrl } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, parseInt(id)),
    with: {
      user: true,
      items: true,
      statusHistory: { with: { changedBy: true }, orderBy: [asc(orderStatusHistory.createdAt)] },
    },
  });

  if (!order) notFound();

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const shippingAddress = order.shippingAddressJson as Record<string, string>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-surface rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full ml-auto", statusInfo?.color)}>
          {statusInfo?.label || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <div className="w-16 h-20 bg-surface relative overflow-hidden rounded flex-shrink-0">
                    <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && " | "}
                      {item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-xs text-muted">Qty: {item.quantity} x {formatPrice(item.unitPrice)}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{parseFloat(order.deliveryCharges) === 0 ? "FREE" : formatPrice(order.deliveryCharges)}</span></div>
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-sale">-{formatPrice(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Status timeline (Feedback 19) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold mb-4">Order Timeline</h2>
            {order.statusHistory.length === 0 ? (
              <p className="text-sm text-muted">No history recorded yet.</p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-5">
                {order.statusHistory.map((h) => {
                  const info = ORDER_STATUSES[h.status as keyof typeof ORDER_STATUSES];
                  return (
                    <li key={h.id} className="ml-5">
                      <span className="absolute -left-[6px] w-3 h-3 rounded-full bg-accent" />
                      <p className="text-sm font-medium">{info?.label || h.status}</p>
                      <p className="text-[12px] text-muted">
                        {new Date(h.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                        {h.changedBy?.name ? ` · ${h.changedBy.name}` : " · system"}
                      </p>
                      {h.note && <p className="text-[12px] text-muted mt-0.5 italic">“{h.note}”</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* Right - Customer & Status */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold mb-3">Customer</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.user?.name || "Guest"}</p>
              <p className="text-muted">{order.user?.email || "-"}</p>
              <p className="text-muted">{order.user?.phone || "-"}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <div className="text-sm space-y-1 text-muted">
              <p className="font-medium text-primary">{shippingAddress?.fullName}</p>
              <p>{shippingAddress?.addressLine1}</p>
              {shippingAddress?.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>{shippingAddress?.city}, {shippingAddress?.province}</p>
              {shippingAddress?.postalCode && <p>{shippingAddress.postalCode}</p>}
              <p>{shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold mb-3">Payment</h2>
            <div className="text-sm space-y-1">
              <p>Method: <span className="font-medium">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</span></p>
              <p>Status: <span className={`font-medium ${order.paymentStatus === "paid" ? "text-success" : order.paymentStatus === "refunded" ? "text-sale" : "text-yellow-600"}`}>{order.paymentStatus}</span></p>
            </div>
          </div>

          {/* Status Management */}
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            currentTrackingNumber={order.trackingNumber || ""}
            currentNotes={order.notes || ""}
          />
        </div>
      </div>
    </div>
  );
}
