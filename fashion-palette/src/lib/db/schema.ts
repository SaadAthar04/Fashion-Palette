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
  collections: many(collections),
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
  collectionId: int("collection_id"), // Feedback 09: collection
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  // ── Identity / sourcing (Feedback 09 required) ──
  sku: varchar({ length: 100 }).notNull().unique(), // local SKU
  originalProductCode: varchar("original_product_code", { length: 120 }),
  season: varchar({ length: 60 }),
  sourceUrl: varchar("source_url", { length: 500 }), // designer source page
  // ── Fashion attributes (Feedback 09) ──
  stitchType: mysqlEnum("stitch_type", ["stitched", "unstitched"]),
  workType: mysqlEnum("work_type", ["print", "embroidered", "plain", "mixed"]),
  pieceCount: mysqlEnum("piece_count", ["1-piece", "2-piece", "3-piece"]),
  fabric: varchar({ length: 100 }), // legacy/general fabric
  shirtFabric: varchar("shirt_fabric", { length: 100 }),
  trouserFabric: varchar("trouser_fabric", { length: 100 }),
  dupattaFabric: varchar("dupatta_fabric", { length: 100 }),
  color: varchar({ length: 80 }),
  careInstructions: text("care_instructions"),
  occasion: varchar({ length: 100 }),
  // ── Commerce (Feedback 09) ──
  deliveryEstimate: varchar("delivery_estimate", { length: 120 }),
  returnEligible: boolean("return_eligible").notNull().default(true),
  taxStatus: varchar("tax_status", { length: 60 }),
  weightGrams: int("weight_grams"),
  shippingClass: varchar("shipping_class", { length: 60 }),
  videoUrl: varchar("video_url", { length: 500 }),
  // ── Merchandising flags ──
  isFeatured: boolean("is_featured").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  // Feedback 11: clear visibility states. Only "published" is public. Hidden =
  // temporarily off-sale; archived = retired (kept for order history).
  publishStatus: mysqlEnum("publish_status", ["draft", "published", "hidden", "archived"]).notNull().default("draft"),
  stockQuantity: int("stock_quantity").notNull().default(0),
  // Feedback 12: per-product low-stock threshold for admin/report alerts.
  lowStockThreshold: int("low_stock_threshold").notNull().default(3),
  // ── SEO (Feedback 09 / 30) ──
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  canonicalUrl: varchar("canonical_url", { length: 500 }),
  socialImageUrl: varchar("social_image_url", { length: 500 }),
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
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
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
  measurementNotes: varchar("measurement_notes", { length: 500 }), // Feedback 09
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
  // Feedback 22/27: least-privilege staff roles. catalogue_editor cannot see
  // payment settings or manage admins; that is enforced server-side.
  role: mysqlEnum(["customer", "catalogue_editor", "order_manager", "admin"])
    .notNull()
    .default("customer"),
  // Feedback 27: deactivating a staff/customer account blocks login and all
  // server-side actions (enforced in requireRole), effectively a force-logout.
  isActive: boolean("is_active").notNull().default(true),
  emailVerifiedAt: timestamp("email_verified_at"), // Feedback 21
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
  // Feedback 19: full lifecycle — keep in sync with ORDER_STATUSES in constants.ts
  status: mysqlEnum([
    "pending",
    "awaiting_payment",
    "paid",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "return_requested",
    "returned",
    "refunded",
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
  couponId: int("coupon_id"),
  couponCode: varchar("coupon_code", { length: 60 }),
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  // COD active at launch; others reserved (Feedback 17 — only tested methods go live in UI)
  paymentMethod: mysqlEnum("payment_method", [
    "cod",
    "bank_transfer",
    "jazzcash",
    "easypaisa",
  ])
    .notNull()
    .default("cod"),
  paymentStatus: mysqlEnum("payment_status", [
    "pending",
    "awaiting",
    "paid",
    "failed",
    "refunded",
  ])
    .notNull()
    .default("pending"),
  paymentReference: varchar("payment_reference", { length: 120 }),
  shippingAddressJson: json("shipping_address_json").notNull(),
  guestEmail: varchar("guest_email", { length: 255 }), // Feedback 15: guest checkout
  guestPhone: varchar("guest_phone", { length: 20 }),
  courier: varchar({ length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  // Final feedback B8: full tracking URL generated from courier + tracking number.
  trackingUrl: varchar("tracking_url", { length: 500 }),
  notes: text(),
  // Final feedback A6: orders flagged as test are excluded from dashboard
  // revenue/order statistics so QA/test activity never skews the numbers.
  isTest: boolean("is_test").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

// ─── ORDER ITEMS ────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: serial().primaryKey(),
  orderId: int("order_id").notNull(),
  productId: int("product_id").notNull(),
  variantId: int("variant_id"),
  productName: varchar("product_name", { length: 500 }).notNull(),
  productImage: varchar("product_image", { length: 500 }).notNull(),
  // Final feedback B7: snapshot the article code so order emails/invoices show a
  // stable reference even if the product's SKU later changes.
  articleCode: varchar("article_code", { length: 120 }),
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

// ─── COLLECTIONS (Feedback 02/09/22) ────────────────────
// A brand's named collection/drop (e.g. Maria B "M Prints", Zaha "Lawn 26").
export const collections = mysqlTable("collections", {
  id: serial().primaryKey(),
  brandId: int("brand_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  description: text(),
  imageUrl: varchar("image_url", { length: 500 }),
  season: varchar({ length: 60 }),
  sourceUrl: varchar("source_url", { length: 500 }), // designer collection page
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  brand: one(brands, {
    fields: [collections.brandId],
    references: [brands.id],
  }),
  products: many(products),
}));

// ─── COUPONS (Feedback 22/24) ───────────────────────────
export const coupons = mysqlTable("coupons", {
  id: serial().primaryKey(),
  code: varchar({ length: 60 }).notNull().unique(),
  description: varchar({ length: 255 }),
  discountType: mysqlEnum("discount_type", ["percent", "fixed"]).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minSubtotal: decimal("min_subtotal", { precision: 10, scale: 2 }).notNull().default("0.00"),
  usageLimit: int("usage_limit"), // null = unlimited
  usedCount: int("used_count").notNull().default(0),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── ORDER STATUS HISTORY (Feedback 19) ─────────────────
// Records staff member, time and optional note for every status change.
export const orderStatusHistory = mysqlTable("order_status_history", {
  id: serial().primaryKey(),
  orderId: int("order_id").notNull(),
  status: varchar({ length: 40 }).notNull(),
  changedByUserId: int("changed_by_user_id"), // null = system
  note: varchar({ length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  changedBy: one(users, {
    fields: [orderStatusHistory.changedByUserId],
    references: [users.id],
  }),
}));

// ─── RETURNS & REFUNDS (Feedback 22) ────────────────────
// One record per return request, tracked from first report to final resolution.
// Evidence, refund detail and inspection notes live here (never spreadsheets).
export const returns = mysqlTable("returns", {
  id: serial().primaryKey(),
  orderId: int("order_id").notNull(),
  userId: int("user_id"), // null for guest orders
  status: mysqlEnum([
    "requested",
    "approved",
    "rejected",
    "item_received",
    "inspected",
    "replacement_sent",
    "refunded",
    "closed",
  ])
    .notNull()
    .default("requested"),
  reason: text().notNull(),
  itemsJson: json("items_json"), // affected items: [{ name, quantity }]
  evidenceUrls: json("evidence_urls"), // photo/video links supplied by customer
  returnAuthorization: varchar("return_authorization", { length: 100 }),
  inspectionResult: text("inspection_result"),
  courier: varchar({ length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  // Refund detail — kept once, to prevent duplicate refunds.
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundMethod: varchar("refund_method", { length: 60 }),
  refundReference: varchar("refund_reference", { length: 120 }),
  refundedAt: timestamp("refunded_at"),
  handledByUserId: int("handled_by_user_id"),
  staffNotes: text("staff_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const returnsRelations = relations(returns, ({ one }) => ({
  order: one(orders, { fields: [returns.orderId], references: [orders.id] }),
  user: one(users, { fields: [returns.userId], references: [users.id] }),
  handledBy: one(users, { fields: [returns.handledByUserId], references: [users.id] }),
}));

// ─── SITE SETTINGS (Feedback 24) ────────────────────────
// Key-value store for owner-editable business rules (delivery charge, free
// threshold, active payment methods, low-stock default). Never store secrets.
export const siteSettings = mysqlTable("site_settings", {
  key: varchar({ length: 80 }).primaryKey(),
  value: text().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── MFA CODES (Feedback 28) ────────────────────────────
// One active email-OTP per user for staff two-factor login. Codes are hashed.
export const mfaCodes = mysqlTable("mfa_codes", {
  userId: int("user_id").primaryKey(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── EMAIL LOG (Feedback 20) ────────────────────────────
// Admin-visible log of sent/failed/retried messages. Never store secrets here.
export const emailLog = mysqlTable("email_log", {
  id: serial().primaryKey(),
  toAddress: varchar("to_address", { length: 255 }).notNull(),
  template: varchar({ length: 80 }).notNull(),
  subject: varchar({ length: 255 }),
  status: mysqlEnum(["queued", "sent", "failed", "retried"]).notNull().default("queued"),
  attempts: int().notNull().default(0),
  errorMessage: varchar("error_message", { length: 500 }),
  relatedOrderId: int("related_order_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── AUTH TOKENS (Feedback 21) ──────────────────────────
// Store only a hash of the token; expiring; single-use.
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: serial().primaryKey(),
  userId: int("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: serial().primaryKey(),
  userId: int("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── AUDIT LOG (Feedback 22/28) ─────────────────────────
// Important product, order, payment and user changes. Never log secrets/PII bodies.
export const auditLog = mysqlTable("audit_log", {
  id: serial().primaryKey(),
  actorUserId: int("actor_user_id"),
  action: varchar({ length: 80 }).notNull(), // e.g. "order.status_change"
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: varchar("entity_id", { length: 60 }),
  meta: json(),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
