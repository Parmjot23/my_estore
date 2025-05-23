"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import Image from "next/image";
import Link from "next/link";
import DiscountBadge from "@/components/Common/DiscountBadge";
import shopData from "@/components/Shop/shopData";

// Select top discounted products from the demo data
const heroProducts = shopData
  .map((p) => ({
    title: p.title,
    image: p.imgs?.previews?.[0] || p.imgs?.thumbnails?.[0] || "/images/hero/hero-01.png",
    discount: Math.round(((p.price - p.discountedPrice) / p.price) * 100),
  }))
  .sort((a, b) => b.discount - a.discount)
  .slice(0, 3);

const gradientClasses = [
  "from-pink-200 via-purple-200 to-indigo-200",
  "from-teal-200 via-emerald-200 to-green-200",
  "from-yellow-200 via-orange-200 to-red-200",
];

const HeroCarousal = () => {
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
          <div className="relative h-[70vh] flex items-center justify-between overflow-hidden px-4 sm:px-12">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[idx % gradientClasses.length]}`}></div>
            <div className="absolute inset-0 bg-white/60"></div>

            <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left max-w-md">
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

            <div className="relative z-10 hidden sm:block">
              <Image src={item.image} alt={item.title} width={380} height={380} />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
