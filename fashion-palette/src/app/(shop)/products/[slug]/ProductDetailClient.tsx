"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import ProductImages from "@/components/product/ProductImages";
import ProductInfo from "@/components/product/ProductInfo";
import SizeSelector from "@/components/product/SizeSelector";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReviewSection from "@/components/product/ReviewSection";
import TrustBadges from "@/components/shared/TrustBadges";
import StockUrgency from "@/components/shared/StockUrgency";
import { Scissors } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import InternationalEnquiry from "@/components/product/InternationalEnquiry";
import NotifyWhenAvailable from "@/components/product/NotifyWhenAvailable";
import ProductStructuredDetails, { getDetailCounts } from "@/components/product/ProductStructuredDetails";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import { productEnquiryUrl, stitchingEnquiryUrl } from "@/lib/whatsapp";
import type { Product, ProductVariant, Review } from "@/types";

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
  sizeGuide: {
    size: string;
    bust: string;
    waist: string;
    hip: string;
    length: string;
  }[];
}

export default function ProductDetailClient({
  product,
  reviews,
  relatedProducts,
  sizeGuide,
}: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
  };

  // B4/B9: structured WhatsApp enquiries carry the product name, article code and link.
  const productRef = {
    name: product.name,
    slug: product.slug,
    articleCode: product.originalProductCode || product.sku,
  };
  const isUnstitched = product.stitchType === "unstitched";

  // A4: only show the ready-to-wear size chart when the product genuinely has
  // sizes (stitched / ready-to-wear). Unstitched suits don't get an RTW size guide.
  const hasSizes = (product.variants ?? []).some((v) => !!v.size);

  // B4: short "What's included" summary for the purchase area, from the
  // structured component list (item names only).
  const includedItems = (product.details?.included ?? []).map((r) => r.item?.trim()).filter(Boolean) as string[];
  const includedSummary = includedItems.slice(0, 5).join(", ");

  const detailCounts = getDetailCounts(product.details);
  const approvedReviews = reviews.filter((r) => r.isApproved).length;

  // B4: build the lower-section accordion — only panels that have content, so an
  // unstitched product never shows an empty RTW size guide, etc.
  const hasLongDescription = Boolean(
    (product.description && product.description.trim()) ||
    (product.shortDescription && product.shortDescription.trim())
  );
  const accordionItems: AccordionItem[] = [];
  if (hasLongDescription) {
    accordionItems.push({
      id: "description",
      title: "Description",
      content: product.description ? (
        <div
          className="prose prose-sm max-w-none text-muted [&_h2]:text-primary [&_h2]:font-semibold [&_h2]:text-base [&_h3]:text-primary [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:tracking-wide [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-[1.8] [&_p]:text-[13px]"
          // Already sanitized server-side on save (B3).
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ) : (
        <p className="text-[13px] text-muted leading-[1.8] font-light">{product.shortDescription}</p>
      ),
    });
  }
  if (detailCounts.included > 0) {
    accordionItems.push({
      id: "included",
      title: "What's included",
      content: <ProductStructuredDetails details={product.details} only={["included"]} />,
    });
  }
  if (detailCounts.components > 0) {
    accordionItems.push({
      id: "measurements",
      title: "Measurements",
      content: <ProductStructuredDetails details={product.details} only={["components"]} />,
    });
  }
  if (detailCounts.care > 0 || detailCounts.disclaimers > 0) {
    accordionItems.push({
      id: "care",
      title: "Care & disclaimers",
      content: <ProductStructuredDetails details={product.details} only={["care", "disclaimers"]} />,
    });
  }
  if (hasSizes) {
    accordionItems.push({
      id: "size-guide",
      title: "Size guide (inches)",
      content: (
        <table className="w-full text-[13px] max-w-2xl">
          <thead>
            <tr className="border-b border-border/50 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              <th className="py-3.5">Size</th>
              <th className="py-3.5">Bust</th>
              <th className="py-3.5">Waist</th>
              <th className="py-3.5">Hip</th>
              <th className="py-3.5">Length</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.map((row) => (
              <tr key={row.size} className="border-b border-border/30">
                <td className="py-3.5 font-medium">{row.size}</td>
                <td className="py-3.5 text-muted">{row.bust}&quot;</td>
                <td className="py-3.5 text-muted">{row.waist}&quot;</td>
                <td className="py-3.5 text-muted">{row.hip}&quot;</td>
                <td className="py-3.5 text-muted">{row.length}&quot;</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  }
  accordionItems.push({
    id: "service",
    title: "Delivery, returns & stitching",
    content: (
      <ul className="space-y-2.5 text-[13px] text-muted">
        <li><Link href="/shipping" className="text-accent hover:underline">Shipping &amp; delivery</Link> — cash on delivery across Pakistan.</li>
        <li><Link href="/returns" className="text-accent hover:underline">Returns &amp; refunds</Link> — report an issue within 48 hours of delivery.</li>
        <li><Link href="/payment" className="text-accent hover:underline">Payment policy</Link> — how payment is handled.</li>
        {isUnstitched && <li><Link href="/stitching" className="text-accent hover:underline">Stitching service</Link> — get this unstitched suit stitched via WhatsApp.</li>}
        <li>International order? Enquire and get a quote on WhatsApp (see the buttons above).</li>
      </ul>
    ),
  });
  accordionItems.push({
    id: "reviews",
    title: `Reviews (${approvedReviews})`,
    content: <ReviewSection reviews={reviews} productId={product.id} />,
  });

  return (
    <div>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              label: product.category?.name || "Products",
              href: `/categories/${product.category?.slug}`,
            },
            {
              label: product.brand?.name || "Brand",
              href: `/brands/${product.brand?.slug}`,
            },
            { label: product.name },
          ]}
          className="mb-8"
        />

        {/* Product Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <ProductImages
            images={product.images || []}
            productName={product.name}
          />

          {/* Info */}
          <div className="space-y-6">
            <ProductInfo product={product} />

            <StockUrgency stock={product.stockQuantity} />

            {/* Size Selector */}
            {product.variants && product.variants.length > 0 && (
              <SizeSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            )}

            {/* Quantity — hidden entirely when out of stock (Feedback 09) */}
            {product.stockQuantity > 0 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Quantity
                </label>
                <div className="flex items-center border border-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-sm hover:bg-surface transition-colors duration-200"
                  >
                    &minus;
                  </button>
                  <span className="px-6 py-3 text-[13px] font-semibold border-x border-border tabular-nums min-w-[48px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      const maxStock =
                        selectedVariant?.stockQuantity ??
                        product.stockQuantity;
                      setQuantity(Math.min(quantity + 1, maxStock));
                    }}
                    className="px-4 py-3 text-sm hover:bg-surface transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
                className="flex-1"
                size="lg"
              >
                <ShoppingBag
                  className="w-4 h-4 mr-2"
                  strokeWidth={1.5}
                />
                {product.stockQuantity <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Button>
              {product.stockQuantity <= 0 ? (
                // B5: out of stock → collect a back-in-stock alert instead of a
                // WhatsApp availability enquiry.
                <div className="flex-1">
                  <NotifyWhenAvailable productId={product.id} variantId={selectedVariant?.id ?? null} />
                </div>
              ) : (
                <a
                  href={productEnquiryUrl(productRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="lg" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    WhatsApp Order
                  </Button>
                </a>
              )}
            </div>

            {/* B4: Get It Stitched — WhatsApp enquiry for eligible unstitched suits.
                The 'Unstitched' product variant/status keeps its name; this is a
                separate action. Checkout stitching is not offered yet. */}
            {isUnstitched && (
              <a
                href={stitchingEnquiryUrl(productRef)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" size="lg" className="w-full">
                  <Scissors className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Get It Stitched on WhatsApp
                </Button>
              </a>
            )}

            {/* B9: international ordering via WhatsApp enquiry */}
            <div className="pt-1">
              <InternationalEnquiry product={productRef} />
            </div>

            {/* B4: What's included — driven by the structured component list when
                present (Shirt, Dupatta, Trouser, …), not a single compressed line. */}
            <div className="pt-4 text-[12px] text-muted leading-relaxed">
              <span className="font-semibold text-primary">What&apos;s included:</span>{" "}
              {includedSummary ? (
                <>
                  {includedSummary}.{" "}
                  <a href="#product-details" className="text-accent hover:underline">Full breakdown below ↓</a>
                </>
              ) : product.pieceCount ? (
                `${product.pieceCount} — see the full component list below.`
              ) : (
                "See the full component list below."
              )}
            </div>

            {/* Policy links under product info (Feedback 08 + Web Pages note) */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] pt-1">
              <Link href="/shipping" className="text-muted hover:text-accent underline underline-offset-2">
                Shipping &amp; Delivery
              </Link>
              <Link href="/returns" className="text-muted hover:text-accent underline underline-offset-2">
                Returns &amp; Refunds
              </Link>
              <Link href="/payment" className="text-muted hover:text-accent underline underline-offset-2">
                Payment Policy
              </Link>
            </div>

            {/* Trust Badges */}
            <TrustBadges
              layout="vertical"
              className="pt-6 border-t border-border/50"
            />
          </div>
        </div>

        {/* B4: Details accordion — clearly separated sections, each answering a
            routine question, instead of one long copied text block. */}
        <div id="product-details" className="mt-16 md:mt-20 scroll-mt-24 max-w-3xl">
          <Accordion items={accordionItems} defaultOpenId="description" />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/50 p-4 md:hidden z-30">
        <Button
          onClick={handleAddToCart}
          disabled={product.stockQuantity <= 0}
          className="w-full"
          size="lg"
        >
          <ShoppingBag className="w-4 h-4 mr-2" strokeWidth={1.5} />
          {product.stockQuantity <= 0
            ? "Out of Stock"
            : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
