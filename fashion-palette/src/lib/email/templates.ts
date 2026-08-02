// Feedback 20: transactional email templates (kept separate from marketing).
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";
const ACCENT = "#7F00FF";

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f2ff;font-family:Arial,Helvetica,sans-serif;color:#1b1b1f;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:16px 0;">
      <span style="font-size:18px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Fashion <span style="color:${ACCENT};">Palette</span></span>
    </div>
    <div style="background:#ffffff;border:1px solid #e7e2ec;border-radius:8px;padding:28px;">
      <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#66636b;font-size:11px;margin-top:20px;">
      Fashion Palette · <a href="${SITE}" style="color:${ACCENT};">${SITE.replace(/^https?:\/\//, "")}</a>
    </p>
  </div></body></html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:1px;">${label}</a>`;

export interface OrderEmailData {
  orderNumber: string;
  total: string;
  paymentMethod: string;
  customerName?: string;
  items: { productName: string; quantity: number; size?: string | null; totalPrice: string }[];
}

export function orderReceivedEmail(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;font-size:13px;">${i.productName}${i.size ? ` (${i.size})` : ""} × ${i.quantity}</td><td style="padding:6px 0;font-size:13px;text-align:right;">Rs ${i.totalPrice}</td></tr>`
    )
    .join("");
  return {
    subject: `Order ${o.orderNumber} received — Fashion Palette`,
    html: layout(
      "We&rsquo;ve received your order request",
      `<p style="font-size:14px;color:#66636b;">Hi ${o.customerName || "there"}, thank you — we&rsquo;ve received your order request <strong>${o.orderNumber}</strong>.</p>
       <p style="font-size:13px;color:#66636b;">This message only confirms that we received your request. It does <strong>not</strong> mean the order is accepted yet. We&rsquo;ll check stock and send a second email confirming your order is accepted and under process.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}
         <tr><td style="padding-top:12px;border-top:1px solid #e7e2ec;font-weight:700;">Total</td><td style="padding-top:12px;border-top:1px solid #e7e2ec;text-align:right;font-weight:700;">Rs ${o.total}</td></tr>
       </table>
       <p style="font-size:13px;color:#66636b;">Payment: ${o.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
       <p style="font-size:13px;color:#66636b;">Need to cancel? You can cancel from <a href="${SITE}/account/orders" style="color:${ACCENT};">your orders</a> or by emailing <a href="mailto:orders@fashionpalette.pk" style="color:${ACCENT};">orders@fashionpalette.pk</a> before the confirmation email is sent.</p>
       <p style="margin-top:20px;">${btn(`${SITE}/account/orders`, "View your order")}</p>`
    ),
  };
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  confirmed: { title: "Your order is accepted and under process", body: "Good news — we&rsquo;ve checked stock and <strong>accepted</strong> your order. It&rsquo;s now under process. As fulfilment has begun it can no longer be cancelled, but your rights for a faulty, wrong, damaged, or misdescribed item still apply." },
  processing: { title: "Your order is being processed", body: "Your order is being packed with care." },
  shipped: { title: "Your order has shipped", body: "Your order is on its way to you." },
  delivered: { title: "Your order was delivered", body: "We hope you love it! Thank you for shopping with us." },
  cancelled: { title: "Your order was cancelled", body: "Your order has been cancelled. If this is unexpected, please contact support." },
  return_requested: { title: "Return requested", body: "We&rsquo;ve received your return request and will be in touch." },
  returned: { title: "Return received", body: "We&rsquo;ve received your returned item." },
  refunded: { title: "Your refund was processed", body: "Your refund has been processed. It may take a few business days to reflect." },
};

export function orderStatusEmail(orderNumber: string, status: string, customerName?: string, courier?: string, tracking?: string) {
  const copy = STATUS_COPY[status] ?? { title: "Order update", body: `Your order status is now: ${status}.` };
  const trackingLine =
    status === "shipped" && (courier || tracking)
      ? `<p style="font-size:13px;color:#66636b;">${courier ? `Courier: ${courier}. ` : ""}${tracking ? `Tracking: ${tracking}.` : ""}</p>`
      : "";
  return {
    subject: `${copy.title} — Order ${orderNumber}`,
    html: layout(
      copy.title,
      `<p style="font-size:14px;color:#66636b;">Hi ${customerName || "there"}, ${copy.body}</p>
       <p style="font-size:13px;color:#66636b;">Order number: <strong>${orderNumber}</strong></p>
       ${trackingLine}
       <p style="margin-top:20px;">${btn(`${SITE}/account/orders`, "View order")}</p>`
    ),
  };
}

export function adminNewOrderEmail(orderNumber: string, total: string, customerName?: string) {
  return {
    subject: `New order ${orderNumber} — Rs ${total}`,
    html: layout(
      "New order received",
      `<p style="font-size:14px;color:#66636b;">A new order has been placed.</p>
       <p style="font-size:13px;">Order: <strong>${orderNumber}</strong><br/>Customer: ${customerName || "—"}<br/>Total: Rs ${total}</p>
       <p style="margin-top:20px;">${btn(`${SITE}/admin/orders`, "Open in admin")}</p>`
    ),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your Fashion Palette password",
    html: layout(
      "Reset your password",
      `<p style="font-size:14px;color:#66636b;">We received a request to reset your password. This link expires in 60 minutes. If you didn&rsquo;t request it, you can ignore this email.</p>
       <p style="margin-top:20px;">${btn(resetUrl, "Reset password")}</p>
       <p style="font-size:12px;color:#66636b;margin-top:16px;word-break:break-all;">${resetUrl}</p>`
    ),
  };
}

export function emailVerificationEmail(verifyUrl: string) {
  return {
    subject: "Verify your email — Fashion Palette",
    html: layout(
      "Verify your email",
      `<p style="font-size:14px;color:#66636b;">Please confirm your email address to activate your account.</p>
       <p style="margin-top:20px;">${btn(verifyUrl, "Verify email")}</p>
       <p style="font-size:12px;color:#66636b;margin-top:16px;word-break:break-all;">${verifyUrl}</p>`
    ),
  };
}
