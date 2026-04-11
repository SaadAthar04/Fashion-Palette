"use client";

import { Star, Quote } from "lucide-react";
import Carousel from "@/components/ui/Carousel";

const testimonials = [
  {
    name: "Ayesha Khan",
    location: "Lahore",
    rating: 5,
    text: "Amazing quality and fast delivery! I ordered a Sana Safinaz suit and it was exactly as shown. Fashion Palette has become my go-to for online shopping.",
  },
  {
    name: "Fatima Ahmed",
    location: "Karachi",
    rating: 5,
    text: "Best online shopping experience in Pakistan. The packaging was beautiful and the fabric quality is outstanding. Will definitely order again!",
  },
  {
    name: "Sana Malik",
    location: "Islamabad",
    rating: 4,
    text: "Great collection of brands all in one place. I love that they have both affordable and luxury options. The customer service via WhatsApp was very helpful.",
  },
  {
    name: "Hira Raza",
    location: "Faisalabad",
    rating: 5,
    text: "I've been shopping from Fashion Palette for over a year now. Their COD option and easy returns make it so convenient. Highly recommended!",
  },
  {
    name: "Zainab Hussain",
    location: "Rawalpindi",
    rating: 5,
    text: "Ordered a Maria B festive suit for Eid and it was absolutely gorgeous. The embroidery work was impeccable. Thank you Fashion Palette!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Testimonials
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">
            What Our Customers Say
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <Carousel slidesToShow={3} showArrows showDots>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-7 md:p-8 h-full flex flex-col border border-border/30"
            >
              {/* Quote Icon */}
              <Quote className="w-6 h-6 text-accent/20 mb-4 rotate-180" strokeWidth={1} />

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < testimonial.rating
                        ? "fill-accent text-accent"
                        : "fill-border text-border"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-[13px] leading-[1.8] text-muted flex-1 font-light">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 pt-5 border-t border-border/50">
                <p className="text-[13px] font-semibold tracking-wide">
                  {testimonial.name}
                </p>
                <p className="text-[11px] text-muted/60 tracking-wider uppercase mt-0.5">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
