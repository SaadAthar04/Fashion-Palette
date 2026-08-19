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

// ── Order emails (Final feedback B7) ──────────────────────────────────────────
// The received / accepted / shipped emails all show the same product summary and
// totals, taken from the STORED order (never live product prices). Each line item
// shows a small thumbnail with text-only fallback (alt text).

export interface OrderLine {
  productName: string;
  productImage: string; // relative (/images/...) or absolute URL
  articleCode?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName?: string;
  paymentMethod: string;
  subtotal: string;
  deliveryCharges: string;
  discountAmount?: string | null;
  total: string;
  items: OrderLine[];
  shippingAddress?: {
    fullName?: string; addressLine1?: string; addressLine2?: string;
    city?: string; province?: string; postalCode?: string; phone?: string;
  } | null;
  actionUrl: string; // secure guest/account link
  courierLabel?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

function imgUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function itemRows(items: OrderLine[]): string {
  return items
    .map((i) => {
      const src = imgUrl(i.productImage);
      const meta = [i.size ? `Size: ${i.size}` : "", i.color ? `Colour: ${i.color}` : "", i.articleCode ? `Code: ${i.articleCode}` : ""]
        .filter(Boolean)
        .join(" · ");
      const thumb = src
        ? `<img src="${src}" width="48" height="60" alt="${i.productName}" style="display:block;width:48px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #e7e2ec;" />`
        : "";
      return `<tr>
        <td width="60" style="padding:8px 10px 8px 0;vertical-align:top;">${thumb}</td>
        <td style="padding:8px 0;vertical-align:top;font-size:13px;color:#1b1b1f;">
          <strong>${i.productName}</strong><br/>
          <span style="font-size:12px;color:#66636b;">${meta ? meta + "<br/>" : ""}Qty ${i.quantity} × Rs ${i.unitPrice}</span>
        </td>
        <td style="padding:8px 0;vertical-align:top;text-align:right;font-size:13px;font-weight:600;white-space:nowrap;">Rs ${i.totalPrice}</td>
      </tr>`;
    })
    .join("");
}

function totalsBlock(o: OrderEmailData): string {
  const discount = o.discountAmount && parseFloat(o.discountAmount) > 0
    ? `<tr><td style="padding:2px 0;font-size:13px;color:#66636b;">Discount</td><td style="padding:2px 0;text-align:right;font-size:13px;color:#b3261e;">- Rs ${o.discountAmount}</td></tr>`
    : "";
  const delivery = parseFloat(o.deliveryCharges) === 0 ? "FREE" : `Rs ${o.deliveryCharges}`;
  return `<table style="width:100%;border-collapse:collapse;margin-top:6px;border-top:1px solid #e7e2ec;padding-top:8px;">
    <tr><td style="padding:6px 0 2px;font-size:13px;color:#66636b;">Subtotal</td><td style="padding:6px 0 2px;text-align:right;font-size:13px;">Rs ${o.subtotal}</td></tr>
    <tr><td style="padding:2px 0;font-size:13px;color:#66636b;">Delivery</td><td style="padding:2px 0;text-align:right;font-size:13px;">${delivery}</td></tr>
    ${discount}
    <tr><td style="padding:8px 0 0;font-size:15px;font-weight:700;border-top:1px solid #e7e2ec;">Total</td><td style="padding:8px 0 0;text-align:right;font-size:15px;font-weight:700;border-top:1px solid #e7e2ec;">Rs ${o.total}</td></tr>
  </table>`;
}

function addressBlock(o: OrderEmailData): string {
  const a = o.shippingAddress;
  if (!a) return "";
  const lines = [a.fullName, a.addressLine1, a.addressLine2, [a.city, a.province].filter(Boolean).join(", "), a.postalCode, a.phone]
    .filter(Boolean)
    .join("<br/>");
  return `<p style="font-size:12px;color:#66636b;margin:16px 0 4px;text-transform:uppercase;letter-spacing:1px;">Delivery address</p>
    <p style="font-size:13px;color:#1b1b1f;margin:0;">${lines}</p>`;
}

function paymentLine(o: OrderEmailData): string {
  const label = o.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer";
  return `<p style="font-size:13px;color:#66636b;margin:12px 0 0;">Payment: <strong>${label}</strong></p>`;
}

export function orderReceivedEmail(o: OrderEmailData) {
  return {
    subject: `Order ${o.orderNumber} received — Fashion Palette`,
    html: layout(
      "We&rsquo;ve received your order request",
      `<p style="font-size:14px;color:#66636b;">Hi ${o.customerName || "there"}, thank you — we&rsquo;ve received your order request <strong>${o.orderNumber}</strong>.</p>
       <p style="font-size:13px;color:#66636b;">This message only confirms that we received your request. It does <strong>not</strong> mean the order is accepted yet. We&rsquo;ll check stock and send a second email confirming your order is accepted and under process.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0 0;">${itemRows(o.items)}</table>
       ${totalsBlock(o)}
       ${paymentLine(o)}
       ${addressBlock(o)}
       <p style="font-size:13px;color:#66636b;margin-top:16px;">Need to cancel? You can cancel this order yourself until we accept it — no account needed.</p>
       <p style="margin-top:16px;">${btn(o.actionUrl, "View or Cancel Order")}</p>`
    ),
  };
}

export function orderAcceptedEmail(o: OrderEmailData) {
  return {
    subject: `Order ${o.orderNumber} accepted — Fashion Palette`,
    html: layout(
      "Your order is accepted and under process",
      `<p style="font-size:14px;color:#66636b;">Good news ${o.customerName || "there"} — we&rsquo;ve checked stock and <strong>accepted</strong> your order <strong>${o.orderNumber}</strong>. Processing has begun.</p>
       <p style="font-size:13px;color:#66636b;">As fulfilment has started, this order can no longer be cancelled. Your rights for a faulty, wrong, damaged or misdescribed item still apply.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0 0;">${itemRows(o.items)}</table>
       ${totalsBlock(o)}
       ${paymentLine(o)}
       ${addressBlock(o)}
       <p style="margin-top:16px;">${btn(o.actionUrl, "View Order")}</p>`
    ),
  };
}

export function orderShippedEmail(o: OrderEmailData) {
  const track = o.trackingUrl || o.actionUrl;
  const courierLine = o.courierLabel || o.trackingNumber
    ? `<p style="font-size:13px;color:#1b1b1f;margin:12px 0 0;">${o.courierLabel ? `Courier: <strong>${o.courierLabel}</strong>` : ""}${o.courierLabel && o.trackingNumber ? "<br/>" : ""}${o.trackingNumber ? `Tracking number: <strong>${o.trackingNumber}</strong>` : ""}</p>`
    : "";
  return {
    subject: `Order ${o.orderNumber} shipped — Fashion Palette`,
    html: layout(
      "Your order has shipped",
      `<p style="font-size:14px;color:#66636b;">Hi ${o.customerName || "there"}, your order <strong>${o.orderNumber}</strong> is on its way.</p>
       ${courierLine}
       <table style="width:100%;border-collapse:collapse;margin:16px 0 0;">${itemRows(o.items)}</table>
       ${totalsBlock(o)}
       ${addressBlock(o)}
       <p style="margin-top:16px;">${btn(track, "Track Shipment")}</p>`
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

export function adminOrderCancelledEmail(orderNumber: string, total: string, customerName?: string, via?: string) {
  return {
    subject: `Order ${orderNumber} cancelled — Rs ${total}`,
    html: layout(
      "An order was cancelled",
      `<p style="font-size:14px;color:#66636b;">An order was cancelled${via ? ` by the ${via}` : ""} before acceptance. Reserved stock has been released.</p>
       <p style="font-size:13px;">Order: <strong>${orderNumber}</strong><br/>Customer: ${customerName || "—"}<br/>Total: Rs ${total}</p>
       <p style="margin-top:20px;">${btn(`${SITE}/admin/orders`, "Open in admin")}</p>`
    ),
  };
}

const RETURN_COPY: Record<string, { title: string; body: string }> = {
  approved: { title: "Your return is approved", body: "We&rsquo;ve approved your return request. We&rsquo;ll share the next steps and any return instructions shortly." },
  rejected: { title: "Update on your return request", body: "After review, your return request was not approved. Please see our reply for the reason; your statutory rights are unaffected." },
  item_received: { title: "We&rsquo;ve received your returned item", body: "Your returned item has arrived and is now being inspected." },
  inspected: { title: "Your return has been inspected", body: "We&rsquo;ve completed inspection of your returned item and will confirm the outcome shortly." },
  replacement_sent: { title: "Your replacement is on its way", body: "A replacement for your return has been dispatched." },
  refunded: { title: "Your refund has been processed", body: "Your refund has been initiated. It may take a few business days to reflect, depending on your bank or wallet." },
};

export function returnStatusEmail(orderNumber: string, status: string, customerName?: string) {
  const copy = RETURN_COPY[status] ?? { title: "Update on your return", body: `Your return status is now: ${status}.` };
  return {
    subject: `${copy.title} — Order ${orderNumber}`,
    html: layout(copy.title,
      `<p style="font-size:14px;color:#66636b;">Hi ${customerName || "there"}, ${copy.body}</p>
       <p style="font-size:13px;color:#66636b;">Order number: <strong>${orderNumber}</strong></p>
       <p style="margin-top:20px;">${btn(`${SITE}/account/orders`, "View order")}</p>`),
  };
}

export function adminReturnRequestEmail(orderNumber: string, reason: string) {
  return {
    subject: `Return requested — Order ${orderNumber}`,
    html: layout("New return request",
      `<p style="font-size:14px;color:#66636b;">A customer reported an issue with order <strong>${orderNumber}</strong>.</p>
       <p style="font-size:13px;color:#66636b;">Reason: ${reason.slice(0, 400)}</p>
       <p style="margin-top:20px;">${btn(`${SITE}/admin/returns`, "Open returns queue")}</p>`),
  };
}

export function adminContactEmail(name: string, email: string, subject: string, message: string) {
  return {
    subject: `Contact message: ${subject}`.slice(0, 120),
    html: layout("New contact message",
      `<p style="font-size:13px;color:#66636b;">From: <strong>${name}</strong> (${email})</p>
       <p style="font-size:13px;color:#66636b;">Subject: ${subject}</p>
       <p style="font-size:14px;color:#1b1b1f;white-space:pre-wrap;">${message.slice(0, 2000)}</p>`),
  };
}

export function adminLowStockEmail(items: { name: string; sku: string; stock: number }[]) {
  const rows = items.map((i) => `<tr><td style="padding:4px 0;font-size:13px;">${i.name} (${i.sku})</td><td style="padding:4px 0;font-size:13px;text-align:right;font-weight:700;">${i.stock}</td></tr>`).join("");
  return {
    subject: `Low stock alert — ${items.length} product(s)`,
    html: layout("Low stock alert",
      `<p style="font-size:14px;color:#66636b;">These products have reached their low-stock threshold:</p>
       <table style="width:100%;border-collapse:collapse;margin:12px 0;">${rows}</table>
       <p style="margin-top:20px;">${btn(`${SITE}/admin/reports`, "View reports")}</p>`),
  };
}

// Final feedback B1: branded VIP welcome email. No discount is promised — the
// programme is early announcements + early access.
export function newsletterWelcomeEmail(unsubscribeUrl: string) {
  return {
    subject: "Welcome to the Fashion Palette VIP list",
    html: layout(
      "You&rsquo;re on the VIP list",
      `<p style="font-size:14px;color:#66636b;">Thank you for joining <strong>Fashion Palette VIP</strong>. You&rsquo;ll be among the first to receive:</p>
       <ul style="font-size:13px;color:#66636b;line-height:1.9;">
         <li>Early announcements of upcoming collections</li>
         <li>First access to new arrivals and launches</li>
       </ul>
       <p style="font-size:13px;color:#66636b;">We&rsquo;ll only email you when there&rsquo;s something worth sharing.</p>
       <p style="margin-top:20px;">${btn(SITE, "Explore new arrivals")}</p>
       <p style="font-size:11px;color:#98959d;margin-top:20px;">You&rsquo;re receiving this because you subscribed at ${SITE.replace(/^https?:\/\//, "")}. <a href="${unsubscribeUrl}" style="color:#98959d;text-decoration:underline;">Unsubscribe</a> at any time.</p>`
    ),
  };
}

// Final feedback B5: back-in-stock alert. Includes product image, name, price and
// a direct link. Never promises that stock is reserved.
export function backInStockEmail(o: { productName: string; productImage: string; price: string; productUrl: string }) {
  const src = /^https?:\/\//.test(o.productImage) ? o.productImage : `${SITE}${o.productImage.startsWith("/") ? "" : "/"}${o.productImage}`;
  return {
    subject: `Back in stock: ${o.productName} — Fashion Palette`,
    html: layout(
      "It&rsquo;s back in stock",
      `<p style="font-size:14px;color:#66636b;">Good news — an item you wanted is available again.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr>
           <td width="72" style="padding-right:12px;vertical-align:top;">${src ? `<img src="${src}" width="64" height="80" alt="${o.productName}" style="display:block;width:64px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #e7e2ec;" />` : ""}</td>
           <td style="vertical-align:top;font-size:14px;color:#1b1b1f;"><strong>${o.productName}</strong><br/><span style="color:#66636b;">Rs ${o.price}</span></td>
         </tr>
       </table>
       <p style="font-size:12px;color:#66636b;">Stock is limited and is not reserved — order soon to avoid missing out.</p>
       <p style="margin-top:16px;">${btn(o.productUrl, "View product")}</p>`
    ),
  };
}

export function mfaCodeEmail(code: string) {
  return {
    subject: "Your Fashion Palette login code",
    html: layout("Your login code",
      `<p style="font-size:14px;color:#66636b;">Use this code to finish signing in. It expires in 10 minutes.</p>
       <p style="font-size:30px;font-weight:700;letter-spacing:6px;text-align:center;margin:20px 0;">${code}</p>
       <p style="font-size:12px;color:#66636b;">If you didn&rsquo;t try to sign in, change your password and contact an administrator.</p>`),
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
