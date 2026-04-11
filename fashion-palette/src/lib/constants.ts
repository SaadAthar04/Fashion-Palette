export const SITE_NAME = "Fashion Palette";
export const SITE_DESCRIPTION =
  "Pakistan's premier multi-brand women's fashion destination. Shop unstitched, ready to wear, luxury & festive collections from top designers.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923276796087";

export const FREE_DELIVERY_THRESHOLD = 5000;
export const DEFAULT_DELIVERY_CHARGES = 200;

export const NAV_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Brands", href: "/brands", hasMegaMenu: true },
  { label: "Unstitched", href: "/categories/unstitched" },
  { label: "Ready to Wear", href: "/categories/ready-to-wear" },
  { label: "Luxury", href: "/categories/luxury-wear" },
  { label: "Sale", href: "/sale", isHighlighted: true },
] as const;

export const FOOTER_LINKS = {
  about: {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Store Locator", href: "/contact" },
    ],
  },
  customerService: {
    title: "Customer Service",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Delivery", href: "/faq#shipping" },
      { label: "Returns & Exchange", href: "/faq#returns" },
      { label: "Track Order", href: "/account/orders" },
    ],
  },
  information: {
    title: "Information",
    links: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Size Guide", href: "/faq#size-guide" },
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

export const ORDER_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  returned: { label: "Returned", color: "bg-gray-100 text-gray-800" },
} as const;
