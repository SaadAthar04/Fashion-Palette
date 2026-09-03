// Phase 2 A2/A6: a single source of truth for "is this product complete enough
// to publish?". Used to (a) hard-block publication in the product API, (b) drive
// the completeness indicator in the admin editor, and (c) flag incomplete
// published products in the data-quality report.
//
// Two tiers:
//   - REQUIRED  → publication is blocked until these are present.
//   - RECOMMENDED → surfaced as warnings, never blocks (some are not applicable
//     to every garment, e.g. a collection or component measurements).

export type CompletenessImage = { imageUrl?: string | null; altText?: string | null };

export type CompletenessDetails = {
  included?: unknown[];
  components?: unknown[];
  care?: unknown[];
} | null;

export type CompletenessInput = {
  brandId?: number | null;
  categoryId?: number | null;
  collectionId?: number | null;
  sku?: string | null;
  originalProductCode?: string | null;
  fabric?: string | null;
  color?: string | null;
  workType?: string | null;
  pieceCount?: string | null;
  careInstructions?: string | null;
  details?: CompletenessDetails;
  images?: CompletenessImage[];
};

export type CompletenessItem = { key: string; label: string; ok: boolean; tier: "required" | "recommended" };

const hasText = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;
const hasId = (v: unknown): boolean => typeof v === "number" && v > 0;
const nonEmptyArray = (v: unknown): boolean => Array.isArray(v) && v.length > 0;

export function getCompletenessItems(p: CompletenessInput): CompletenessItem[] {
  const images = p.images ?? [];
  const realImages = images.filter((img) => hasText(img.imageUrl));
  const allHaveAlt = realImages.length > 0 && realImages.every((img) => hasText(img.altText));
  const details = p.details ?? null;

  return [
    { key: "brandId", label: "Brand", ok: hasId(p.brandId), tier: "required" },
    { key: "categoryId", label: "Category", ok: hasId(p.categoryId), tier: "required" },
    { key: "articleCode", label: "Article code / SKU", ok: hasText(p.sku) || hasText(p.originalProductCode), tier: "required" },
    { key: "fabric", label: "Fabric", ok: hasText(p.fabric), tier: "required" },
    { key: "color", label: "Colour", ok: hasText(p.color), tier: "required" },
    { key: "workType", label: "Work type", ok: hasText(p.workType), tier: "required" },
    { key: "pieceCount", label: "Piece count", ok: hasText(p.pieceCount), tier: "required" },
    { key: "images", label: "At least one product image", ok: realImages.length > 0, tier: "required" },
    { key: "altText", label: "Alt text on every image", ok: allHaveAlt, tier: "required" },
    // Recommended (surfaced, not blocking):
    { key: "care", label: "Care instructions", ok: hasText(p.careInstructions) || nonEmptyArray(details?.care), tier: "recommended" },
    { key: "included", label: "What's included (components)", ok: nonEmptyArray(details?.included), tier: "recommended" },
    { key: "measurements", label: "Measurements", ok: nonEmptyArray(details?.components), tier: "recommended" },
    { key: "collection", label: "Collection", ok: hasId(p.collectionId), tier: "recommended" },
  ];
}

// Fields that BLOCK publication when missing.
export function getMissingRequiredFields(p: CompletenessInput): CompletenessItem[] {
  return getCompletenessItems(p).filter((i) => i.tier === "required" && !i.ok);
}

// Recommended fields still missing (for the indicator / report, never blocks).
export function getMissingRecommendedFields(p: CompletenessInput): CompletenessItem[] {
  return getCompletenessItems(p).filter((i) => i.tier === "recommended" && !i.ok);
}
