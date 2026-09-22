"use client";

import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { TESTIMONIALS } from "../../data/site";
import { SectionHeading } from "../ui/SectionHeading";

export function Testimonials() {
  return (
    <section className="section-py bg-surfaceMuted">
      <div className="container-px">
        <SectionHeading eyebrow="What Our Clients Say" title="Trusted by Brands and Print Shops Alike" align="center" />
        <div className="mt-12 max-w-3xl mx-auto">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            slidesPerView={1}
            className="pb-10"
          >
            {TESTIMONIALS.map((t) => (
              <SwiperSlide key={t.name}>
                <div className="rounded-2xl bg-white border border-primary-50 shadow-card p-8 text-center">
                  <div className="flex items-center justify-center gap-1 text-accent-600">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="mt-5 text-lg text-primary-900 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-6 font-display font-semibold">{t.name}</p>
                  <p className="text-sm text-primary-400">{t.role}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
