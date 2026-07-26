// ─────────────────────────────────────────────────────────────
// Canonical brand + collection + source mapping (Feedback 02 / 06)
//
// Single source of truth for:
//   • the brand directory / All Brands page + mega menu
//   • the Shopify importer (scripts/import-shopify.ts) — each collection's
//     products are fetched from `<sourceUrl>/products.json`.
//
// Spelling is fixed here and used everywhere (Feedback 02: one display
// spelling, one slug — never mix "Maria B" / "Maria.B" / "MariaB").
// ─────────────────────────────────────────────────────────────

export interface BrandCollectionSource {
  name: string;
  slug: string;
  season?: string;
  /** Designer's official collection page. Shopify => append /products.json */
  sourceUrl: string;
}

export interface BrandSource {
  name: string;
  slug: string;
  /** false = approved brand (Feedback 02) but no image source supplied yet */
  hasSource: boolean;
  collections: BrandCollectionSource[];
}

export const BRAND_SOURCES: BrandSource[] = [
  {
    name: "Afrozeh",
    slug: "afrozeh",
    hasSource: true,
    collections: [
      { name: "A-Lawn 26 Luxury Lawn", slug: "afrozeh-a-lawn-26", season: "Summer 2026", sourceUrl: "https://www.afrozeh.com/collections/a-lawn-26-luxury-lawn-dresses-online" },
    ],
  },
  {
    name: "Baroque",
    slug: "baroque",
    hasSource: false, // approved brand — awaiting collection/image source
    collections: [],
  },
  {
    name: "Coco",
    slug: "coco",
    hasSource: true,
    collections: [
      { name: "Coco Lawn Edit II 26", slug: "coco-lawn-edit-ii-26", season: "Summer 2026", sourceUrl: "https://www.cocobyzarashahjahan.com/collections/coco-lawn-edit-ii-26" },
      { name: "Coco Prints Drop III 2026", slug: "coco-prints-drop-iii-2026", season: "Summer 2026", sourceUrl: "https://www.cocobyzarashahjahan.com/collections/coco-prints-drop-iii-2026" },
    ],
  },
  {
    name: "Crimson",
    slug: "crimson",
    hasSource: true,
    collections: [
      { name: "Flow by Crimson Lawn 26", slug: "crimson-flow-lawn-26", season: "Summer 2026", sourceUrl: "https://www.crimson.com.pk/collections/flow-by-crimson-lawn26" },
    ],
  },
  {
    name: "Elan",
    slug: "elan",
    hasSource: true,
    collections: [
      { name: "Elan Lawn 26", slug: "elan-lawn-26", season: "Summer 2026", sourceUrl: "https://elan.pk/collections/elan-lawn26" },
    ],
  },
  {
    name: "Farah Talib Aziz",
    slug: "farah-talib-aziz",
    hasSource: false, // site is not a standard Shopify store — no products.json. Hidden until a source is supplied.
    collections: [],
  },
  {
    name: "Jugnu Lahore",
    slug: "jugnu",
    hasSource: true, // in the sourcing list; confirm vs approved-brands list
    collections: [
      { name: "Unstitched", slug: "jugnu-unstitched", sourceUrl: "https://jugnulahore.com/collections/unstitched" },
    ],
  },
  {
    name: "Kanwal Malik",
    slug: "kanwal-malik",
    hasSource: true, // in the sourcing list; confirm vs approved-brands list
    collections: [
      { name: "Unstitched", slug: "kanwal-malik-unstitched", sourceUrl: "https://www.kanwalmalik.com/collections/unstitched" },
    ],
  },
  {
    name: "M Basics",
    slug: "m-basics",
    hasSource: true, // in the sourcing list; confirm vs approved-brands list
    collections: [
      { name: "Dreamscape Unstitched Eid II", slug: "m-basics-dreamscape-eid-ii", sourceUrl: "https://www.mbasics.pk/collections/dreamscape-unstitched-eid-ll" },
    ],
  },
  {
    name: "Maria B",
    slug: "maria-b",
    hasSource: true,
    collections: [
      { name: "M Prints", slug: "maria-b-m-prints", sourceUrl: "https://www.mariab.pk/collections/m-prints" },
      { name: "Chiffon", slug: "maria-b-chiffon", sourceUrl: "https://www.mariab.pk/collections/chiffon" },
      { name: "Lawn", slug: "maria-b-lawn", sourceUrl: "https://www.mariab.pk/collections/lawn" },
    ],
  },
  {
    name: "Mushq",
    slug: "mushq",
    hasSource: true,
    collections: [
      { name: "Soleil Prints", slug: "mushq-soleil-prints", sourceUrl: "https://mushq.com/collections/soleil-prints" },
      { name: "Amoi Luxury Lawn", slug: "mushq-amoi-luxury-lawn", sourceUrl: "https://mushq.com/collections/amoi-luxury-lawn" },
    ],
  },
  {
    name: "Qalamkar",
    slug: "qalamkar",
    hasSource: true,
    collections: [
      { name: "Festive Lawn 26", slug: "qalamkar-festive-lawn-26", season: "Festive 2026", sourceUrl: "https://www.qalamkar.com.pk/collections/festive-lawn-26" },
      { name: "Qprints", slug: "qalamkar-qprints", sourceUrl: "https://www.qalamkar.com.pk/collections/qprints-1" },
    ],
  },
  {
    name: "Republic Womenswear",
    slug: "republic-womenswear",
    hasSource: true,
    collections: [
      { name: "Reine Eid Luxury Lawn 26", slug: "republic-reine-eid-lawn-26", season: "Eid 2026", sourceUrl: "https://www.republicwomenswear.com/collections/reine-eid-luxury-lawn-26" },
    ],
  },
  {
    name: "Saira Rizwan",
    slug: "saira-rizwan",
    hasSource: true,
    collections: [
      { name: "Luxury Unstitched 26", slug: "saira-rizwan-luxury-unstitched-26", season: "Summer 2026", sourceUrl: "https://sairarizwan.pk/collections/luxury-unstitched26" },
      { name: "Joolie Prints", slug: "saira-rizwan-joolie-prints", sourceUrl: "https://sairarizwan.pk/collections/joolie-prints" },
    ],
  },
  {
    name: "Saira Shakira",
    slug: "saira-shakira",
    hasSource: true,
    collections: [
      { name: "Bloom Lawn", slug: "saira-shakira-bloom-lawn", season: "Summer 2026", sourceUrl: "https://sairashakira.com/collections/bloom-saira-shakira-lawn" },
    ],
  },
  {
    name: "Sobia Nazir",
    slug: "sobia-nazir",
    hasSource: true,
    collections: [
      { name: "Luxury Lawn Eid Edition 26", slug: "sobia-nazir-luxury-lawn-eid-26", season: "Eid 2026", sourceUrl: "https://sobianazir.net/collections/luxury-lawn-eid-edition-26" },
    ],
  },
  {
    name: "Soraya",
    slug: "soraya",
    hasSource: true,
    collections: [
      { name: "Lumene Festive 25-26", slug: "soraya-lumene-festive-25-26", season: "Festive 2025-26", sourceUrl: "https://soraya.pk/collections/lumene-festive-25-26" },
    ],
  },
  {
    name: "Suffuse",
    slug: "suffuse",
    hasSource: true,
    collections: [
      { name: "Lawn Eid Unstitched 26", slug: "suffuse-lawn-eid-unstitched-26", season: "Eid 2026", sourceUrl: "https://suffuse.pk/collections/lawn-eid-unstitched26" },
    ],
  },
  {
    name: "Zaha",
    slug: "zaha",
    hasSource: true,
    collections: [
      { name: "Zaha Lawn 26", slug: "zaha-lawn-26", season: "Summer 2026", sourceUrl: "https://www.zaha.pk/collections/zaha-lawn26" },
      { name: "Zaha Festive Lawn 26", slug: "zaha-festive-lawn-26", season: "Festive 2026", sourceUrl: "https://www.zaha.pk/collections/zaha-festive-lawn26" },
    ],
  },
  {
    name: "Zainab Chottani",
    slug: "zainab-chottani",
    hasSource: false, // approved brand — awaiting collection/image source
    collections: [],
  },
  {
    name: "Zara Shahjahan",
    slug: "zara-shahjahan",
    hasSource: true,
    collections: [
      { name: "Satori 2026", slug: "zara-shahjahan-satori-2026", season: "Summer 2026", sourceUrl: "https://zarashahjahan.com/collections/satori-2026" },
    ],
  },
];

// Storefront categories (Feedback 01 nav): Unstitched, Prints, Embroidered, Stitching.
export const STOREFRONT_CATEGORIES = [
  { name: "Unstitched", slug: "unstitched", sortOrder: 1, description: "Unstitched lawn, luxury & festive fabric from leading designers." },
  { name: "Prints", slug: "prints", sortOrder: 2, description: "Printed lawn and summer collections." },
  { name: "Embroidered", slug: "embroidered", sortOrder: 3, description: "Embroidered luxury and festive suits." },
  { name: "Stitching", slug: "stitching", sortOrder: 4, description: "Custom stitching & made-to-measure service." },
] as const;
