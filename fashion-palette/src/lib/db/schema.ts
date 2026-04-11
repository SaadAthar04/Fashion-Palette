import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  mysqlEnum,
  json,
  serial,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ─── BRANDS ─────────────────────────────────────────────
export const brands = mysqlTable("brands", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  logoUrl: varchar("logo_url", { length: 500 }),
  description: text(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

// ─── CATEGORIES ─────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  description: text(),
  imageUrl: varchar("image_url", { length: 500 }),
  parentId: int("parent_id"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

// ─── PRODUCTS ───────────────────────────────────────────
export const products = mysqlTable("products", {
  id: serial().primaryKey(),
  name: varchar({ length: 500 }).notNull(),
  slug: varchar({ length: 500 }).notNull().unique(),
  description: text(),
  shortDescription: varchar("short_description", { length: 1000 }),
  brandId: int("brand_id").notNull(),
  categoryId: int("category_id").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  fabric: varchar({ length: 100 }),
  occasion: varchar({ length: 100 }),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  stockQuantity: int("stock_quantity").notNull().default(0),
  sku: varchar({ length: 100 }).notNull().unique(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
  orderItems: many(orderItems),
}));

// ─── PRODUCT IMAGES ─────────────────────────────────────
export const productImages = mysqlTable("product_images", {
  id: serial().primaryKey(),
  productId: int("product_id").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  sortOrder: int("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// ─── PRODUCT VARIANTS ───────────────────────────────────
export const productVariants = mysqlTable("product_variants", {
  id: serial().primaryKey(),
  productId: int("product_id").notNull(),
  size: varchar({ length: 20 }),
  color: varchar({ length: 50 }),
  colorHex: varchar("color_hex", { length: 7 }),
  stockQuantity: int("stock_quantity").notNull().default(0),
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  skuSuffix: varchar("sku_suffix", { length: 20 }),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

// ─── USERS ──────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  role: mysqlEnum(["customer", "admin"]).notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  cartItems: many(cartItems),
  wishlists: many(wishlists),
}));

// ─── ADDRESSES ──────────────────────────────────────────
export const addresses = mysqlTable("addresses", {
  id: serial().primaryKey(),
  userId: int("user_id").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar({ length: 20 }).notNull(),
  addressLine1: varchar("address_line1", { length: 500 }).notNull(),
  addressLine2: varchar("address_line2", { length: 500 }),
  city: varchar({ length: 100 }).notNull(),
  province: varchar({ length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }),
  isDefault: boolean("is_default").notNull().default(false),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

// ─── ORDERS ─────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: serial().primaryKey(),
  userId: int("user_id"),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: mysqlEnum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ])
    .notNull()
    .default("pending"),
  subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
  deliveryCharges: decimal("delivery_charges", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cod", "bank_transfer"])
    .notNull()
    .default("cod"),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "refunded"])
    .notNull()
    .default("pending"),
  shippingAddressJson: json("shipping_address_json").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  notes: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// ─── ORDER ITEMS ────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: serial().primaryKey(),
  orderId: int("order_id").notNull(),
  productId: int("product_id").notNull(),
  variantId: int("variant_id"),
  productName: varchar("product_name", { length: 500 }).notNull(),
  productImage: varchar("product_image", { length: 500 }).notNull(),
  size: varchar({ length: 20 }),
  color: varchar({ length: 50 }),
  quantity: int().notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ─── REVIEWS ────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: serial().primaryKey(),
  productId: int("product_id").notNull(),
  userId: int("user_id").notNull(),
  rating: int().notNull(),
  comment: text(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// ─── CART ITEMS ─────────────────────────────────────────
export const cartItems = mysqlTable("cart_items", {
  id: serial().primaryKey(),
  userId: int("user_id"),
  sessionId: varchar("session_id", { length: 100 }),
  productId: int("product_id").notNull(),
  variantId: int("variant_id"),
  quantity: int().notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

// ─── BANNERS ────────────────────────────────────────────
export const banners = mysqlTable("banners", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }),
  subtitle: varchar({ length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  mobileImageUrl: varchar("mobile_image_url", { length: 500 }),
  linkUrl: varchar("link_url", { length: 500 }),
  ctaText: varchar("cta_text", { length: 100 }),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
});

// ─── NEWSLETTER SUBSCRIBERS ─────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: serial().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
});

// ─── WISHLISTS ──────────────────────────────────────────
export const wishlists = mysqlTable("wishlists", {
  id: serial().primaryKey(),
  userId: int("user_id").notNull(),
  productId: int("product_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));
