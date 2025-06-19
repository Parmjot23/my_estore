"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import Image from "next/image";
import Link from "next/link";
import DiscountBadge from "@/components/Common/DiscountBadge";
import { useEffect, useState } from "react";
import { getSlideshowItems } from "@/lib/apiService";
import { SlideshowItem } from "@/types/slideshow";
import { getProductImage } from "@/utils/productImage";


const gradientClasses = [
  "from-pink-200 via-purple-200 to-indigo-200",
  "from-teal-200 via-emerald-200 to-green-200",
  "from-yellow-200 via-orange-200 to-red-200",
];

const HeroCarousal = () => {
  const [slides, setSlides] = useState<SlideshowItem[]>([]);

  useEffect(() => {
    getSlideshowItems()
      .then((data) => setSlides(data))
      .catch((err) => console.error("Failed to load slides", err));
  }, []);

  const heroProducts = slides
    .map((s) => {
      const p = s.product_details;
      const imgSrc = getProductImage(p);
      if (!imgSrc) return null;
      return {
        title: p?.name || "",
        image: imgSrc,
        discount: p?.get_discount_percentage || 0,
      };
    })
    .filter(Boolean) as { title: string; image: string; discount: number }[];


  return (
    <Swiper
      spaceBetween={30}
      centeredSlides
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {heroProducts.map((item, idx) => (
        <SwiperSlide key={idx}>
          <div className="relative h-[70vh] flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 overflow-hidden px-4 sm:px-8 xl:px-0 max-w-[1170px] mx-auto">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[idx % gradientClasses.length]}`}></div>
            <div className="absolute inset-0 bg-white/60"></div>

            <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left max-w-md bg-white/80 p-4 sm:p-0 sm:bg-transparent rounded">
              <DiscountBadge percentage={item.discount} className="mb-4" />
              <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl text-dark-base mb-3">
                {item.title}
              </h2>
              <p className="text-dark-base mb-6">Limited time deal on our best price.</p>
              <Link
                href="/shop"
                className="inline-block bg-accent text-white py-3 px-9 rounded-md hover:bg-[#b88d4f] transition"
              >
                Shop Now
              </Link>
            </div>

            <div className="relative z-10">
              <Image src={item.image} alt={item.title} width={380} height={380} className="w-60 sm:w-auto h-auto" />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
