import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `Rs. ${num.toLocaleString("en-PK")}`;
}

export function calculateDiscount(basePrice: number | string, salePrice: number | string): number {
  const base = typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;
  const sale = typeof salePrice === "string" ? parseFloat(salePrice) : salePrice;
  if (base <= 0) return 0;
  return Math.round(((base - sale) / base) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FP-${timestamp}-${random}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder/product-1.jpg";
  if (path.startsWith("http")) return path;
  return path;
}

export function getWhatsAppUrl(productName?: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923276796087";
  const message = productName
    ? `Hi! I'm interested in ${productName} from Fashion Palette.`
    : "Hi! I'd like to know more about your products.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
