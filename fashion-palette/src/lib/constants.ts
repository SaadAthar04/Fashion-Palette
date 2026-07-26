export const SITE_NAME = "Fashion Palette";
export const SITE_DESCRIPTION =
  "Multi-brand women's fashion destination. Shop unstitched, prints, embroidered and festive collections from leading Pakistani designers.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923276796087";

// Feedback 16: free delivery above Rs. 10,000; fixed Rs. 500 charge on every order.
export const FREE_DELIVERY_THRESHOLD = 10000;
export const DEFAULT_DELIVERY_CHARGES = 500;

// Feedback 01: exact final navigation order. "New Arrivals" stays plural everywhere.
// Brands opens a mega menu and also has a full All Brands page.
export const NAV_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Unstitched", href: "/categories/unstitched" },
  { label: "Brands", href: "/brands", hasMegaMenu: true },
  { label: "Prints", href: "/categories/prints" },
  { label: "Embroidered", href: "/categories/embroidered" },
  { label: "Stitching", href: "/categories/stitching" },
] as const;

export const FOOTER_LINKS = {
  about: {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      // Feedback 24: Store Locator removed — no physical store to link to.
    ],
  },
  customerService: {
    title: "Customer Service",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Track Order", href: "/account/orders" },
    ],
  },
  information: {
    title: "Information",
    links: [
      { label: "Payment", href: "/payment" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
} as const;

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/fashionpalette.pk",
  instagram: "https://instagram.com/fashionpalette.pk",
  tiktok: "https://tiktok.com/@fashionpalette.pk",
  youtube: "https://youtube.com/@fashionpalette",
} as const;

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
