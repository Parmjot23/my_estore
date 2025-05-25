// src/components/Common/PreviewSlider.tsx
"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules"; // Added Navigation, Thumbs
import { useCallback, useEffect, useRef, useState } from "react";
import "swiper/css/navigation";
import "swiper/css/pagination"; // If you want pagination dots
import "swiper/css/thumbs"; // For thumbnail navigation
import "swiper/css";
import Image from "next/image";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { ProductMediaItem } from "@/types/product"; // Import ProductMediaItem

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/770x500/eee/ccc?text=No+Image";


const PreviewSliderModal = () => {
  const { closePreviewModal, isModalPreviewOpen } = usePreviewSlider();
  // Product data from Redux, set by the component opening the modal (e.g., ShopDetails or QuickViewModal)
  const productData = useAppSelector((state) => state.productDetailsReducer.value);

  const sliderRef = useRef<any>(null); // For main Swiper
  const thumbsSwiperRef = useRef<any>(null); // For thumbs Swiper

  const [imagesToDisplay, setImagesToDisplay] = useState<string[]>([]);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);


  useEffect(() => {
    if (isModalPreviewOpen && productData) {
      let sources: string[] = [];
      if (productData.product_media && productData.product_media.length > 0) {
        sources = productData.product_media
          .filter((media: ProductMediaItem) => media.media_type === 'IMG' && media.file_url)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((media: ProductMediaItem) => media.file_url as string);
      } else if (productData.cover_image_url) {
        sources.push(productData.cover_image_url);
      } else if (productData.imgs?.previews && productData.imgs.previews.length > 0) {
        sources = productData.imgs.previews.filter(url => !!url);
      }

      if (sources.length === 0) {
        sources.push(PLACEHOLDER_IMAGE_URL); // Fallback if no images
      }
      setImagesToDisplay(sources);
      // Reset to the first image when modal opens or product changes
      setInitialSlideIndex(0);
      if (sliderRef.current && sliderRef.current.swiper) {
        sliderRef.current.swiper.slideTo(0, 0); // Go to first slide without animation
      }
       if (thumbsSwiperRef.current && thumbsSwiperRef.current.swiper) {
        thumbsSwiperRef.current.swiper.slideTo(0, 0);
      }
    }
  }, [isModalPreviewOpen, productData]);


  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  if (!isModalPreviewOpen || !productData || imagesToDisplay.length === 0) {
    return null;
  }

  return (
    <div
      className={`preview-slider fixed w-full h-screen z-[999999] inset-0 flex justify-center items-center bg-black/90 p-4 transition-opacity duration-300 ease-in-out ${
        isModalPreviewOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <button
        onClick={closePreviewModal}
        aria-label="Close image preview"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-gray-300 z-[1000]"
      >
        <svg className="fill-current" width="30" height="30" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"/></svg>
      </button>

      <div className="relative w-full max-w-3xl xl:max-w-4xl">
        {/* Main Image Slider */}
        <Swiper
          ref={sliderRef}
          modules={[Navigation, Pagination, Thumbs]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            prevEl: '.preview-slider-prev', // Custom navigation buttons
            nextEl: '.preview-slider-next',
          }}
          pagination={imagesToDisplay.length > 1 ? { clickable: true, el: '.swiper-pagination-custom' } : false}
          thumbs={{ swiper: thumbsSwiperRef.current && !thumbsSwiperRef.current.destroyed ? thumbsSwiperRef.current : null }}
          initialSlide={initialSlideIndex} // Set initial slide
          className="rounded-lg overflow-hidden"
        >
          {imagesToDisplay.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="flex justify-center items-center aspect-[4/3] bg-black/20"> {/* Added aspect ratio and bg */}
                <Image
                  src={src || PLACEHOLDER_IMAGE_URL}
                  alt={`${productData.name} - Image ${index + 1}`}
                  width={770} // Max width for the image
                  height={500} // Corresponding height (adjust aspect ratio as needed)
                  unoptimized
                  className="object-contain max-h-[70vh] w-auto" // Ensure it fits
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;}}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons (outside Swiper container for better positioning) */}
        {imagesToDisplay.length > 1 && (
            <>
                <button className="preview-slider-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition-colors" aria-label="Previous image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/></svg>
                </button>
                <button className="preview-slider-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition-colors" aria-label="Next image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" fill="currentColor"/></svg>
                </button>
                {/* Custom Pagination container */}
                <div className="swiper-pagination-custom text-center p-2"></div>
            </>
        )}


        {/* Thumbnails Slider */}
        {imagesToDisplay.length > 1 && (
          <div className="mt-4">
            <Swiper
              onSwiper={(swiper) => { thumbsSwiperRef.current = swiper; }}
              loop={false}
              spaceBetween={10}
              slidesPerView={ Math.min(5, imagesToDisplay.length) } // Show up to 5 thumbs
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Navigation, Thumbs]}
              className="preview-thumbs-slider"
            >
              {imagesToDisplay.map((src, index) => (
                <SwiperSlide key={`thumb-${index}`} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity rounded-md overflow-hidden border-2 border-transparent swiper-slide-thumb-active:border-blue-500 swiper-slide-thumb-active:opacity-100">
                   <div className="aspect-square bg-gray-700">
                    <Image
                        src={src || PLACEHOLDER_IMAGE_URL}
                        alt={`Thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        unoptimized
                        className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;}}
                    />
                   </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
       {/* Basic styling for active thumbnail (add to your global CSS or a style tag if preferred) */}
       <style jsx global>{`
            .preview-thumbs-slider .swiper-slide-thumb-active {
                border-color: #3C50E0; /* Tailwind blue-500 */
                opacity: 1;
            }
            .swiper-pagination-custom .swiper-pagination-bullet {
                background-color: #fff;
                opacity: 0.7;
            }
            .swiper-pagination-custom .swiper-pagination-bullet-active {
                background-color: #3C50E0; /* Tailwind blue-500 */
                opacity: 1;
            }
        `}</style>
    </div>
  );
};

export default PreviewSliderModal;