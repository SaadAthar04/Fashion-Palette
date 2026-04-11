"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  slidesToShow?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  loop?: boolean;
}

export default function Carousel({
  children,
  className,
  slidesToShow = 1,
  autoPlay = false,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = false,
  loop = true,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || !emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [emblaApi, autoPlay, autoPlayInterval]);

  const slideWidth = `${100 / slidesToShow}%`;

  return (
    <div className={cn("relative group/carousel", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {Array.isArray(children)
            ? children.map((child, index) => (
                <div
                  key={index}
                  className="min-w-0 shrink-0 px-1.5 md:px-2 first:pl-0 last:pr-0"
                  style={{ flex: `0 0 ${slideWidth}` }}
                >
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>

      {/* Arrows — refined luxury style */}
      {showArrows && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!loop && !canScrollPrev}
            className={cn(
              "absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 bg-white border border-border/50 flex items-center justify-center",
              "hover:border-accent hover:text-accent transition-all duration-300",
              "opacity-0 group-hover/carousel:opacity-100",
              "disabled:opacity-0 shadow-sm"
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!loop && !canScrollNext}
            className={cn(
              "absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 bg-white border border-border/50 flex items-center justify-center",
              "hover:border-accent hover:text-accent transition-all duration-300",
              "opacity-0 group-hover/carousel:opacity-100",
              "disabled:opacity-0 shadow-sm"
            )}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Dots — minimal luxury style */}
      {showDots && scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2.5 mt-6">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-[2px] rounded-full transition-all duration-500",
                index === selectedIndex
                  ? "bg-accent w-8"
                  : "bg-border w-5 hover:bg-muted"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
