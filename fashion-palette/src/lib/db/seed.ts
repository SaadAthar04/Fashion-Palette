import "dotenv/config";
import { db, pool } from "./index";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed brands
  const brandData = [
    { name: "Gul Ahmed", slug: "gul-ahmed", logoUrl: "/images/brands/gul-ahmed.png", sortOrder: 1 },
    { name: "Khaadi", slug: "khaadi", logoUrl: "/images/brands/khaadi.png", sortOrder: 2 },
    { name: "Sana Safinaz", slug: "sana-safinaz", logoUrl: "/images/brands/sana-safinaz.png", sortOrder: 3 },
    { name: "Maria B", slug: "maria-b", logoUrl: "/images/brands/maria-b.png", sortOrder: 4 },
    { name: "Sapphire", slug: "sapphire", logoUrl: "/images/brands/sapphire.png", sortOrder: 5 },
    { name: "Limelight", slug: "limelight", logoUrl: "/images/brands/limelight.png", sortOrder: 6 },
    { name: "Alkaram Studio", slug: "alkaram-studio", logoUrl: "/images/brands/alkaram.png", sortOrder: 7 },
    { name: "Baroque", slug: "baroque", logoUrl: "/images/brands/baroque.png", sortOrder: 8 },
    { name: "Elan", slug: "elan", logoUrl: "/images/brands/elan.png", sortOrder: 9 },
    { name: "Zara Shahjahan", slug: "zara-shahjahan", logoUrl: "/images/brands/zara-shahjahan.png", sortOrder: 10 },
  ];

  await db.insert(schema.brands).values(brandData);
  console.log("✅ Brands seeded");

  // Seed categories
  const categoryData = [
    { name: "Unstitched", slug: "unstitched", imageUrl: "/images/categories/unstitched.jpg", sortOrder: 1 },
    { name: "Ready to Wear", slug: "ready-to-wear", imageUrl: "/images/categories/ready-to-wear.jpg", sortOrder: 2 },
    { name: "Luxury Wear", slug: "luxury-wear", imageUrl: "/images/categories/luxury-wear.jpg", sortOrder: 3 },
    { name: "Festive Collection", slug: "festive", imageUrl: "/images/categories/festive.jpg", sortOrder: 4 },
    { name: "Sale", slug: "sale", imageUrl: "/images/categories/sale.jpg", sortOrder: 5 },
    { name: "Accessories", slug: "accessories", imageUrl: "/images/categories/accessories.jpg", sortOrder: 6 },
  ];

  await db.insert(schema.categories).values(categoryData);
  console.log("✅ Categories seeded");

  // Seed admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  await db.insert(schema.users).values({
    name: "Admin",
    email: "admin@fashionpalette.pk",
    passwordHash,
    phone: "03001234567",
    role: "admin",
  });
  console.log("✅ Admin user seeded");

  // Seed sample products
  const sampleProducts = [
    {
      name: "Gul Ahmed Premium Lawn 3PC - Spring Collection",
      slug: "gul-ahmed-premium-lawn-3pc-spring",
      shortDescription: "Premium lawn 3-piece suit with embroidered front and chiffon dupatta",
      description: "Elevate your spring wardrobe with this premium lawn 3-piece suit featuring intricate embroidery on the front panel, complemented by a delicate chiffon dupatta with printed borders. The trouser fabric comes in a matching solid color for a coordinated look.",
      brandId: 1,
      categoryId: 1,
      basePrice: "4990.00",
      salePrice: "3990.00",
      fabric: "Lawn",
      occasion: "Casual",
      isFeatured: true,
      isNewArrival: true,
      stockQuantity: 25,
      sku: "GA-PL-001",
    },
    {
      name: "Khaadi Embroidered Khaddar 2PC Winter",
      slug: "khaadi-embroidered-khaddar-2pc",
      shortDescription: "Warm khaddar 2-piece with bold embroidery",
      description: "Stay warm and stylish this winter with Khaadi's embroidered khaddar 2-piece suit. Features bold geometric embroidery patterns on a rich khaddar fabric.",
      brandId: 2,
      categoryId: 1,
      basePrice: "3490.00",
      fabric: "Khaddar",
      occasion: "Daily Wear",
      isNewArrival: true,
      stockQuantity: 30,
      sku: "KH-EK-001",
    },
    {
      name: "Sana Safinaz Luxury Formal - Silk Ensemble",
      slug: "sana-safinaz-luxury-formal-silk",
      shortDescription: "Luxurious silk formal with handcrafted details",
      description: "An exquisite silk formal ensemble from Sana Safinaz featuring handcrafted embellishments, delicate pearl work, and a flowing silhouette perfect for weddings and formal occasions.",
      brandId: 3,
      categoryId: 3,
      basePrice: "18990.00",
      fabric: "Silk",
      occasion: "Wedding",
      isFeatured: true,
      stockQuantity: 10,
      sku: "SS-LF-001",
    },
    {
      name: "Maria B Festive Eid Collection - Chiffon",
      slug: "maria-b-festive-eid-chiffon",
      shortDescription: "Festive chiffon 3-piece with gold accents",
      description: "Celebrate Eid in elegance with Maria B's festive chiffon collection. Features gold thread embroidery, sequin details, and a matching chiffon dupatta with pearl edging.",
      brandId: 4,
      categoryId: 4,
      basePrice: "12490.00",
      salePrice: "9990.00",
      fabric: "Chiffon",
      occasion: "Eid",
      isFeatured: true,
      isBestSeller: true,
      stockQuantity: 15,
      sku: "MB-FC-001",
    },
    {
      name: "Sapphire Ready to Wear Kurta - Daily Essential",
      slug: "sapphire-rtw-kurta-daily",
      shortDescription: "Comfortable cotton kurta for everyday wear",
      description: "A beautifully designed ready-to-wear cotton kurta from Sapphire. Perfect for daily wear with its comfortable fabric, relaxed fit, and elegant minimal embroidery.",
      brandId: 5,
      categoryId: 2,
      basePrice: "2990.00",
      fabric: "Cotton",
      occasion: "Daily Wear",
      isNewArrival: true,
      stockQuantity: 40,
      sku: "SP-RW-001",
    },
    {
      name: "Limelight Printed Cambric 3PC",
      slug: "limelight-printed-cambric-3pc",
      shortDescription: "Vibrant printed cambric with embroidered neckline",
      description: "Add a pop of color to your wardrobe with Limelight's printed cambric 3-piece suit. Features a vibrant digital print with embroidered neckline and sleeves.",
      brandId: 6,
      categoryId: 1,
      basePrice: "3290.00",
      salePrice: "2490.00",
      fabric: "Cambric",
      occasion: "Casual",
      isBestSeller: true,
      stockQuantity: 35,
      sku: "LL-PC-001",
    },
    {
      name: "Alkaram Studio Jacquard Suit - Premium",
      slug: "alkaram-jacquard-suit-premium",
      shortDescription: "Premium jacquard suit with intricate weaving",
      description: "A premium jacquard suit from Alkaram Studio featuring intricate woven patterns and elegant embroidery. Comes with matching dupatta and trouser fabric.",
      brandId: 7,
      categoryId: 1,
      basePrice: "5990.00",
      fabric: "Jacquard",
      occasion: "Formal",
      isFeatured: true,
      stockQuantity: 20,
      sku: "AK-JS-001",
    },
    {
      name: "Baroque Luxury Velvet - Wedding Edition",
      slug: "baroque-luxury-velvet-wedding",
      shortDescription: "Opulent velvet dress for wedding season",
      description: "Make a statement at your next wedding event with Baroque's luxury velvet edition. Features rich velvet fabric with gold tilla work, paired with an organza dupatta.",
      brandId: 8,
      categoryId: 3,
      basePrice: "22990.00",
      fabric: "Velvet",
      occasion: "Wedding",
      isBestSeller: true,
      stockQuantity: 8,
      sku: "BQ-LV-001",
    },
    {
      name: "Elan Bridal Couture - Signature Series",
      slug: "elan-bridal-couture-signature",
      shortDescription: "Signature bridal couture with hand embellishments",
      description: "The ultimate bridal statement piece from Elan's Signature Series. Hand-embellished with Swarovski crystals, gold threadwork, and delicate pearl detailing on premium organza.",
      brandId: 9,
      categoryId: 3,
      basePrice: "89990.00",
      fabric: "Organza",
      occasion: "Wedding",
      isFeatured: true,
      stockQuantity: 3,
      sku: "EL-BC-001",
    },
    {
      name: "Zara Shahjahan Organza Formal - Heritage",
      slug: "zara-shahjahan-organza-heritage",
      shortDescription: "Heritage-inspired organza formal wear",
      description: "A heritage-inspired formal piece from Zara Shahjahan featuring exquisite handwork on organza fabric. The traditional motifs blend seamlessly with contemporary design elements.",
      brandId: 10,
      categoryId: 3,
      basePrice: "34990.00",
      salePrice: "27990.00",
      fabric: "Organza",
      occasion: "Formal",
      isNewArrival: true,
      stockQuantity: 5,
      sku: "ZS-OF-001",
    },
    {
      name: "Gul Ahmed Cotton Kurti - Summer Basics",
      slug: "gul-ahmed-cotton-kurti-summer",
      shortDescription: "Light cotton kurti for summer comfort",
      description: "Beat the heat in style with Gul Ahmed's summer basics cotton kurti. Lightweight, breathable, and designed for all-day comfort.",
      brandId: 1,
      categoryId: 2,
      basePrice: "1990.00",
      fabric: "Cotton",
      occasion: "Casual",
      stockQuantity: 50,
      sku: "GA-CK-002",
    },
    {
      name: "Maria B Linen Winter Collection",
      slug: "maria-b-linen-winter",
      shortDescription: "Warm linen suit with wool shawl",
      description: "Stay cozy with Maria B's winter linen collection. Includes a beautifully embroidered linen suit paired with a printed wool shawl.",
      brandId: 4,
      categoryId: 1,
      basePrice: "6990.00",
      fabric: "Linen",
      occasion: "Daily Wear",
      isBestSeller: true,
      stockQuantity: 22,
      sku: "MB-LW-002",
    },
  ];

  await db.insert(schema.products).values(sampleProducts);
  console.log("✅ Products seeded");

  // Seed product images
  const imageData = sampleProducts.map((product, idx) => ({
    productId: idx + 1,
    imageUrl: `/images/placeholder/product-${(idx % 4) + 1}.jpg`,
    altText: product.name,
    sortOrder: 0,
    isPrimary: true,
  }));

  await db.insert(schema.productImages).values(imageData);
  console.log("✅ Product images seeded");

  // Seed product variants
  const variantData = sampleProducts.flatMap((_, idx) => [
    { productId: idx + 1, size: "S", stockQuantity: 5, priceAdjustment: "0.00" },
    { productId: idx + 1, size: "M", stockQuantity: 10, priceAdjustment: "0.00" },
    { productId: idx + 1, size: "L", stockQuantity: 8, priceAdjustment: "0.00" },
    { productId: idx + 1, size: "XL", stockQuantity: 5, priceAdjustment: "0.00" },
  ]);

  await db.insert(schema.productVariants).values(variantData);
  console.log("✅ Product variants seeded");

  // Seed banners
  await db.insert(schema.banners).values([
    {
      title: "New Spring Collection",
      subtitle: "Discover the latest trends in Pakistani fashion",
      imageUrl: "/images/banners/hero-1.jpg",
      mobileImageUrl: "/images/banners/hero-1-mobile.jpg",
      linkUrl: "/new-arrivals",
      ctaText: "Shop Now",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Flat 30% Off",
      subtitle: "On selected luxury & festive collections",
      imageUrl: "/images/banners/hero-2.jpg",
      mobileImageUrl: "/images/banners/hero-2-mobile.jpg",
      linkUrl: "/sale",
      ctaText: "Shop Sale",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Wedding Season",
      subtitle: "Explore our exclusive bridal & formal wear",
      imageUrl: "/images/banners/hero-3.jpg",
      mobileImageUrl: "/images/banners/hero-3-mobile.jpg",
      linkUrl: "/categories/luxury-wear",
      ctaText: "Explore Collection",
      sortOrder: 3,
      isActive: true,
    },
  ]);
  console.log("✅ Banners seeded");

  // Seed sample reviews
  const customerHash = await bcrypt.hash("customer123", 12);
  await db.insert(schema.users).values({
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    passwordHash: customerHash,
    phone: "03211234567",
    role: "customer",
  });

  await db.insert(schema.reviews).values([
    { productId: 1, userId: 2, rating: 5, comment: "Beautiful fabric quality! The embroidery is exquisite. Will definitely order again.", isApproved: true },
    { productId: 4, userId: 2, rating: 4, comment: "Loved the design and color. Fits perfectly. Delivery was quick too.", isApproved: true },
    { productId: 5, userId: 2, rating: 5, comment: "Perfect daily wear kurta. Comfortable and stylish. Great value for money.", isApproved: true },
  ]);
  console.log("✅ Reviews seeded");

  console.log("🎉 Seeding complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
