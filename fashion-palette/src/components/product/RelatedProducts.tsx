import Carousel from "@/components/ui/Carousel";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export default function RelatedProducts({
  products,
  title = "You May Also Like",
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Recommended
          </span>
          <h2 className="text-2xl md:text-3xl font-light mt-3 tracking-tight">
            {title}
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <Carousel slidesToShow={4} showArrows showDots loop>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
