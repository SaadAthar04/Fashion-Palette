import Link from "next/link";
import Image from "next/image";

const collections = [
  {
    title: "Luxury Pret",
    subtitle: "Refined elegance for every occasion",
    href: "/categories/luxury-wear",
    image: "/images/categories/luxury-wear.jpg",
  },
  {
    title: "Casual Wear",
    subtitle: "Effortless everyday style",
    href: "/categories/ready-to-wear",
    image: "/images/categories/ready-to-wear.jpg",
  },
  {
    title: "Wedding Collection",
    subtitle: "Exquisite bridal & formal wear",
    href: "/categories/festive",
    image: "/images/categories/festive.jpg",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Curated For You
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">
            Featured Collections
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative aspect-[3/4] overflow-hidden bg-surface"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Multi-layer overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

              {/* Content — positioned at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-[10px] text-white/50 uppercase tracking-[0.25em] mb-2 font-medium">
                  {collection.subtitle}
                </p>
                <h3 className="text-xl md:text-2xl font-light text-white tracking-wide">
                  {collection.title}
                </h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-semibold group-hover:text-accent transition-colors duration-300">
                    Shop Now
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-white/60 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300"
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
