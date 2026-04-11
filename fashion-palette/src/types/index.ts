export type Brand = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  children?: Category[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  brandId: number;
  categoryId: number;
  basePrice: string;
  salePrice: string | null;
  fabric: string | null;
  occasion: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  stockQuantity: number;
  sku: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
};

export type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: number;
  productId: number;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  stockQuantity: number;
  priceAdjustment: string;
  skuSuffix: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

export type Address = {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  isDefault: boolean;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentMethod = "cod" | "bank_transfer";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type Order = {
  id: number;
  userId: number | null;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  deliveryCharges: string;
  discountAmount: string;
  total: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddressJson: string;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  variantId: number | null;
  productName: string;
  productImage: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type Review = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: Date;
  user?: Pick<User, "name">;
};

export type CartItem = {
  id: number;
  userId: number | null;
  sessionId: string | null;
  productId: number;
  variantId: number | null;
  quantity: number;
  createdAt: Date;
  product?: Product;
  variant?: ProductVariant;
};

export type Banner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  ctaText: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type NewsletterSubscriber = {
  id: number;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
};

export type WishlistItem = {
  id: number;
  userId: number;
  productId: number;
  createdAt: Date;
  product?: Product;
};

// Cart store types
export type CartStoreItem = {
  productId: number;
  variantId: number | null;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
};

export type FilterState = {
  brands: string[];
  priceRange: [number, number];
  fabrics: string[];
  sizes: string[];
  colors: string[];
  occasions: string[];
  sort: string;
  page: number;
};
