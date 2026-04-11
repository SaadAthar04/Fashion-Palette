import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const instagramPosts = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  image: `/images/placeholder/insta-${(i % 4) + 1}.jpg`,
}));

export default function InstagramFeed() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <InstagramIcon className="w-4 h-4 text-accent" />
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
              @fashionpalette.pk
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light tracking-tight">
            Follow Us on Instagram
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square bg-surface group overflow-hidden"
            >
              <Image
                src={post.image}
                alt="Instagram post"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-400 flex items-center justify-center">
                <InstagramIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
