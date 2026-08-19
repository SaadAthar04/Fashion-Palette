// Final feedback B4/B9: structured WhatsApp enquiry links. All are client-safe
// (they use NEXT_PUBLIC_* values only). The number is normalised to digits.

const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923276796087").replace(/\D/g, "");
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

function waLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function productUrl(slug: string): string {
  return `${SITE.replace(/\/$/, "")}/products/${slug}`;
}

export interface ProductRef {
  name: string;
  slug: string;
  articleCode?: string | null;
}

// "Get It Stitched" — opens WhatsApp prefilled with product name, article code
// and link (B4). Stitching price and timeline are confirmed in chat.
export function stitchingEnquiryUrl(p: ProductRef): string {
  const code = p.articleCode ? ` (Article ${p.articleCode})` : "";
  const message =
    `Hi Fashion Palette, I'd like custom stitching for this unstitched suit:\n` +
    `${p.name}${code}\n${productUrl(p.slug)}\n\n` +
    `Please share the stitching price, required measurements and completion time.`;
  return waLink(message);
}

// International enquiry — prefilled with product, article code, URL, selected
// display currency and destination country (B9). The displayed currency is only
// an estimate; the final quote is confirmed in chat.
export function internationalEnquiryUrl(p: ProductRef, opts?: { currency?: string; country?: string }): string {
  const code = p.articleCode ? ` (Article ${p.articleCode})` : "";
  const lines = [
    `Hi Fashion Palette, I'd like to order internationally:`,
    `${p.name}${code}`,
    productUrl(p.slug),
  ];
  if (opts?.country) lines.push(`Destination: ${opts.country}`);
  if (opts?.currency) lines.push(`Displayed currency: ${opts.currency} (estimate only)`);
  lines.push(``, `Please confirm availability, the final product price, shipping and payment method.`);
  return waLink(lines.join("\n"));
}

// Generic product enquiry (kept for the standard "WhatsApp Order" button).
export function productEnquiryUrl(p: ProductRef): string {
  const code = p.articleCode ? ` (Article ${p.articleCode})` : "";
  return waLink(`Hi Fashion Palette, I'm interested in this product:\n${p.name}${code}\n${productUrl(p.slug)}`);
}
