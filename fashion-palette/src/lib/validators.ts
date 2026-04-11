import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(/^03\d{9}$/, "Enter a valid Pakistani phone number (03XXXXXXXXX)")
    .optional()
    .or(z.literal("")),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^03\d{9}$/, "Enter a valid phone number (03XXXXXXXXX)"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  notes: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(500),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  brandId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  fabric: z.string().optional(),
  occasion: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  sku: z.string().min(2),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required"),
  slug: z.string().min(2),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const bannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  mobileImageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  ctaText: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
