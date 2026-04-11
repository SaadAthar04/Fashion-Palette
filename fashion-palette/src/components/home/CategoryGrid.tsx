import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

const fallbackCategories = [
  {
    name: "Unstitched",
    slug: "unstitched",
    imageUrl: "/images/categories/unstitched.jpg",
  },
  {
    name: "Ready to Wear",
    slug: "ready-to-wear",
    imageUrl: "/images/categories/ready-to-wear.jpg",
  },
  {
    name: "Luxury Wear",
    slug: "luxury-wear",
    imageUrl: "/images/categories/luxury-wear.jpg",
  },
  {
    name: "Festive",
    slug: "festive",
    imageUrl: "/images/categories/festive.jpg",
  },
  { name: "Sale", slug: "sale", imageUrl: "/images/categories/sale.jpg" },
  {
    name: "Accessories",
    slug: "accessories",
    imageUrl: "/images/categories/accessories.jpg",
  },
];

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const items =
    categories.length > 0
      ? categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
        }))
      : fallbackCategories;

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Collections
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">
            Shop by Category
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {items.map((category) => (
            <Link
              key={category.slug}
              href={
                category.slug === "sale"
                  ? "/sale"
                  : `/categories/${category.slug}`
              }
              className="group relative aspect-[3/4] overflow-hidden bg-surface"
            >
              <Image
                src={category.imageUrl || "/images/placeholder/category.jpg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                <h3 className="text-white text-sm md:text-base font-semibold tracking-[0.1em] uppercase">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/50 text-[11px] tracking-wider uppercase group-hover:text-accent transition-colors duration-300">
                    Explore
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-white/50 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
