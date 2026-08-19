"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductForm from "@/components/admin/ProductForm";
import ProductHistory from "@/components/admin/ProductHistory";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12 text-muted">Product not found</div>;
  }

  const initialData = {
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    brandId: product.brandId,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    salePrice: product.salePrice || "",
    fabric: product.fabric || "",
    occasion: product.occasion || "",
    // Feedback 01/08: load the real values so editing doesn't silently reset
    // publish status or wipe the fashion fields.
    stitchType: product.stitchType || "",
    workType: product.workType || "",
    pieceCount: product.pieceCount || "",
    season: product.season || "",
    color: product.color || "",
    careInstructions: product.careInstructions || "",
    sourceUrl: product.sourceUrl || "",
    publishStatus: product.publishStatus || "draft",
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    isActive: product.isActive,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold ?? 3,
    sku: product.sku,
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    images: product.images || [],
    variants: product.variants || [],
    details: product.details || null,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={initialData} productId={parseInt(id)} />
      <div className="mt-6 max-w-2xl">
        <ProductHistory productId={parseInt(id)} />
      </div>
    </div>
  );
}
