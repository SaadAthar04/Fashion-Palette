import { revalidatePath } from "next/cache";

// Invalidate the ISR cache for every public catalogue surface after a product
// changes, so a draft/unpublish/edit takes effect immediately (Feedback 01) —
// not after the 5-minute revalidate window.
export function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/brands/[slug]", "page");
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/brands");
  revalidatePath("/new-arrivals");
  revalidatePath("/sale");
}
