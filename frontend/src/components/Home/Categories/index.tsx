// frontend/src/components/Home/Categories/index.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/navigation";
import "swiper/css";

import { getCategories, API_ROOT } from '@/lib/apiService';
import { Category as CategoryType } from '@/types/product'; // Using richer Category type from product.ts
import SingleItem from "./SingleItem";
import Image from "next/image"; // For navigation button icons

const Categories = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<any>(null); // Added type for Swiper instance

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCategories = await getCategories(); // Corrected function call
        // Filter categories that have an image_url, as SingleItem expects it
        setCategories(fetchedCategories.filter(cat => cat.image_url) || []);
      } catch (err: any) {
        console.error("Categories Component - Error fetching categories:", err);
        if (err && err.status === 401) {
          // logout handled in apiService; avoid showing error message
          return;
        }
        setError(err.message || "An unknown error occurred while fetching categories.");
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  if (isLoading) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
          <div className="mb-10 text-center"><p>Loading categories...</p></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
          <div className="mb-10 text-center">
            <h2 className="font-semibold text-xl text-red-500">Error Loading Categories</h2>
            <p className="text-red-400">{error}</p>
            <p className="text-xs text-gray-500 mt-1">Tried to fetch from: {API_ROOT}/shop/categories/</p>
            <p className="text-xs text-gray-500 mt-1">Please ensure the backend server is running and accessible.</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0 && !isLoading) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
           <div className="mb-10 text-center"><p>No categories with images to display.</p></div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <Image
                  src="/images/icons/icon-07.svg" // Placeholder, update if needed
                  alt="icon"
                  width={20}
                  height={20}
                />
                Categories
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                Browse by Category
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handlePrev} className="swiper-button-prev">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z" /></svg>
              </button>
              <button onClick={handleNext} className="swiper-button-next">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z" /></svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={6}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 10 },
              640: { slidesPerView: 3, spaceBetween: 15 },
              768: { slidesPerView: 4, spaceBetween: 20 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
            }}
            className="!pb-1"
          >
            {categories.map((item) => (
              <SwiperSlide key={item.id}>
                <SingleItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;