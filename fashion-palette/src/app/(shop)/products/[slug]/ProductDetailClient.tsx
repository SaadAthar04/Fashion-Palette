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
import { productEnquiryUrl, stitchingEnquiryUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
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
  const [activeTab, setActiveTab] = useState<
    "description" | "size-guide" | "reviews"
  >("description");
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

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "size-guide" as const, label: "Size Guide" },
    {
      id: "reviews" as const,
      label: `Reviews (${reviews.filter((r) => r.isApproved).length})`,
    },
  ];

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

            {/* What's included (Feedback 08) */}
            <div className="pt-4 text-[12px] text-muted leading-relaxed">
              <span className="font-semibold text-primary">What&apos;s included:</span>{" "}
              {product.pieceCount
                ? `${product.pieceCount} — see the full component list in the Description below.`
                : "See the full component list in the Description below."}
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

        {/* Tabs Section */}
        <div id="product-details" className="mt-16 md:mt-20 scroll-mt-24">
          <div className="flex border-b border-border/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 border-b -mb-px",
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-10">
            {activeTab === "description" && (
              <div className="max-w-3xl">
                {product.description ? (
                  <div
                    className="prose prose-sm max-w-none text-muted [&_h3]:text-primary [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:tracking-wide [&_h3]:uppercase [&_ul]:list-disc [&_ul]:pl-5 [&_p]:leading-[1.8] [&_p]:text-[13px]"
                    dangerouslySetInnerHTML={{
                      __html: product.description.replace(
                        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                        ""
                      ),
                    }}
                  />
                ) : (
                  <p className="text-[13px] text-muted leading-[1.8] font-light">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            )}

            {activeTab === "size-guide" && (
              <div className="max-w-2xl">
                <h3 className="text-sm font-semibold tracking-wide uppercase mb-6">
                  Size Guide (inches)
                </h3>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        Size
                      </th>
                      <th className="py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        Bust
                      </th>
                      <th className="py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        Waist
                      </th>
                      <th className="py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        Hip
                      </th>
                      <th className="py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        Length
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuide.map((row) => (
                      <tr
                        key={row.size}
                        className="border-b border-border/30"
                      >
                        <td className="py-3.5 font-medium">
                          {row.size}
                        </td>
                        <td className="py-3.5 text-muted">
                          {row.bust}&quot;
                        </td>
                        <td className="py-3.5 text-muted">
                          {row.waist}&quot;
                        </td>
                        <td className="py-3.5 text-muted">
                          {row.hip}&quot;
                        </td>
                        <td className="py-3.5 text-muted">
                          {row.length}&quot;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewSection
                reviews={reviews}
                productId={product.id}
              />
            )}
          </div>
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
