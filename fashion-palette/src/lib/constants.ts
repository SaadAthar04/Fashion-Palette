export const SITE_NAME = "Fashion Palette";
export const SITE_DESCRIPTION =
  "Multi-brand women's fashion destination. Shop unstitched, prints, embroidered and festive collections from leading Pakistani designers.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923276796087";

// Feedback 16: free delivery above Rs. 10,000; fixed Rs. 500 charge on every order.
export const FREE_DELIVERY_THRESHOLD = 10000;
export const DEFAULT_DELIVERY_CHARGES = 500;

// Final feedback A1: price data-integrity thresholds (PKR is the only stored base
// price). A published product must have base_price > 0 (blank/zero/negative is
// hard-blocked). Prices below this floor are almost certainly un-converted
// foreign-currency values (the live catalogue had 35 items at Rs. 77–238), so
// they are surfaced as warnings in the import preview and the data-integrity
// report — but may still be published if an editor deliberately confirms them.
export const LOW_PRICE_WARNING_PKR = 1000;

// Feedback 01 + Final feedback B4: navigation order. "New Arrivals" stays plural.
// Brands opens a mega menu. Prints & Embroidered are now a submenu under
// Unstitched (removed as top-level items). Clicking Unstitched opens the
// catalogue; hover/focus/tap reveals the submenu.
export const NAV_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  {
    label: "Unstitched",
    href: "/categories/unstitched",
    submenu: [
      { label: "Prints", href: "/categories/prints" },
      { label: "Embroidered", href: "/categories/embroidered" },
    ],
  },
  { label: "Brands", href: "/brands", hasMegaMenu: true },
  { label: "Stitching", href: "/stitching" }, // service page, not a product category
] as const;

// Phase 2 B5: help topics — the single obvious route to every recurring
// customer-support question. Reused by the footer Help Centre column and the
// /help hub page so they never drift apart.
export const HELP_TOPICS = [
  { label: "FAQ", href: "/faq", blurb: "Answers to the most common questions." },
  { label: "Track Order", href: "/account/orders", blurb: "Check the status of an order." },
  { label: "Shipping & Delivery", href: "/shipping", blurb: "Delivery times, charges and couriers." },
  { label: "Returns & Refunds", href: "/returns", blurb: "How to report an issue or return." },
  { label: "Payments", href: "/payment", blurb: "Cash on Delivery and payment safety." },
  { label: "Stitching", href: "/stitching", blurb: "Get an unstitched suit stitched via WhatsApp." },
  { label: "International Orders", href: "/contact", blurb: "Ordering from outside Pakistan (WhatsApp quote)." },
  { label: "Contact Us", href: "/contact", blurb: "Reach our support team." },
] as const;

// Phase 2 B5: footer columns. Kept concise so mobile isn't a wall of links;
// legal links live in the bottom bar.
export const FOOTER_LINKS = {
  shop: {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Unstitched", href: "/categories/unstitched" },
      { label: "Brands", href: "/brands" },
      { label: "Sale", href: "/sale" },
    ],
  },
  helpCentre: {
    title: "Help Centre",
    links: [
      { label: "Help Centre", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Track Order", href: "/account/orders" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Payments", href: "/payment" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Stitching", href: "/stitching" },
    ],
  },
  account: {
    title: "Account",
    links: [
      { label: "My Account", href: "/account" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Cart", href: "/cart" },
    ],
  },
} as const;

// Legal links shown in the footer's bottom bar.
export const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
] as const;

// Compact, verifiable trust/service claims for the footer strip. Only add a
// claim here if it is genuinely true and operational.
export const TRUST_CLAIMS = [
  "Cash on Delivery",
  "100% Original Products",
  "Delivery Across Pakistan",
  "Customer Support",
] as const;

// Feedback 03/26/31: public business + contact details, sourced from the
// approved policy documents. Emails are routed by purpose.
export const CONTACT = {
  location: "People’s Colony, Faisalabad, Punjab, Pakistan",
  whatsappDisplay: "0327-6796087",
  operatedBy: "Meelan Ahmad",
  // Phase 2 B5: shown in the footer/Help Centre only once confirmed. Leave null
  // to hide (never advertise unverified hours). Client to confirm real hours.
  supportHours: null as string | null,
  emails: {
    general: "contact@fashionpalette.pk",
    orders: "orders@fashionpalette.pk",
    support: "support@fashionpalette.pk",
    privacy: "privacy@fashionpalette.pk",
  },
} as const;

// Feedback 06: only show social icons for accounts that genuinely exist. Set a
// value to the real profile URL to display it; leave null to hide the icon.
// (Client to confirm real handles before these are switched on.)
export const SOCIAL_LINKS: Record<"facebook" | "instagram" | "tiktok" | "youtube", string | null> = {
  facebook: null,
  instagram: null,
  tiktok: null,
  youtube: null,
};

// Feedback 03/33: only advertise payment methods that are actually active and
// tested at checkout. Card/bank/wallet get added here once each is enabled.
export const ACTIVE_PAYMENT_METHODS = ["Cash on Delivery"] as const;

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Kashmir",
  "Gilgit-Baltistan",
] as const;

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
  "Mardan",
  "Sukkur",
  "Muzaffarabad",
  "Other",
] as const;

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

export const PRODUCT_OCCASIONS = [
  "Casual",
  "Formal",
  "Party",
  "Wedding",
  "Festive",
  "Eid",
  "Daily Wear",
] as const;

export const PRODUCT_FABRICS = [
  "Lawn",
  "Cotton",
  "Silk",
  "Chiffon",
  "Organza",
  "Linen",
  "Khaddar",
  "Cambric",
  "Jacquard",
  "Velvet",
  "Net",
  "Georgette",
] as const;

// Feedback 19: full order lifecycle. Keep keys in sync with the DB enum (schema.ts).
export const ORDER_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  awaiting_payment: { label: "Awaiting Payment", color: "bg-amber-100 text-amber-800" },
  paid: { label: "Paid", color: "bg-teal-100 text-teal-800" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  return_requested: { label: "Return Requested", color: "bg-orange-100 text-orange-800" },
  returned: { label: "Returned", color: "bg-gray-100 text-gray-800" },
  refunded: { label: "Refunded", color: "bg-slate-100 text-slate-800" },
} as const;

// Feedback 22: return lifecycle states shown in the admin returns queue.
export const RETURN_STATUSES = {
  requested: { label: "Requested", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  item_received: { label: "Item Received", color: "bg-indigo-100 text-indigo-800" },
  inspected: { label: "Inspected", color: "bg-purple-100 text-purple-800" },
  replacement_sent: { label: "Replacement Sent", color: "bg-teal-100 text-teal-800" },
  refunded: { label: "Refunded", color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700" },
} as const;
