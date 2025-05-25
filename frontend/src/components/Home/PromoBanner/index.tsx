"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPromoBanners } from "@/lib/apiService";
import { PromoBanner as PromoBannerType } from "@/types/promoBanner";
import { getProductImage } from "@/utils/productImage";


const PromoBanner = () => {
  const [banners, setBanners] = useState<PromoBannerType[]>([]);

  useEffect(() => {
    getPromoBanners()
      .then((data) => setBanners(data))
      .catch((err) => console.error("Failed to load banners", err));
  }, []);

  const getImage = (product?: any): string | undefined => getProductImage(product);

  const big = banners.find((b) => b.size === "large" && getImage(b.product_details));
  const smalls = banners
    .filter((b) => b.size === "small" && getImage(b.product_details))
    .slice(0, 2);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {big && (
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                {big.product_details?.name}
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                UP TO {big.product_details?.get_discount_percentage}% OFF
              </h2>

              <Link
                href={`/product/${big.product_details?.slug}`}
                className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
              >
                Buy Now
              </Link>
            </div>

            {getImage(big.product_details) && (
              <Image
                src={getImage(big.product_details) as string}
                alt={big.product_details?.name || "Promo image"}
                className="absolute bottom-0 right-4 lg:right-26 -z-1"
                width={274}
                height={350}
              />
            )}
          </div>
        )}

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {smalls.map((banner, idx) => (
            <div
              key={banner.id}
              className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
            >
              {getImage(banner.product_details) && (
                <Image
                  src={getImage(banner.product_details) as string}
                  alt={banner.product_details?.name || "Promo image"}
                  className={`absolute top-1/2 -translate-y-1/2 ${idx === 0 ? 'left-3 sm:left-10' : 'right-3 sm:right-8.5'} -z-1`}
                  width={idx === 0 ? 241 : 200}
                  height={idx === 0 ? 241 : 200}
                />
              )}

              <div className={idx === 0 ? 'text-right' : ''}>
                <span className="block text-lg text-dark mb-1.5">
                  {banner.product_details?.name}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  Up to {banner.product_details?.get_discount_percentage}% off
                </h2>

                <Link
                  href={`/product/${banner.product_details?.slug}`}
                  className={`inline-flex font-medium text-custom-sm text-white ${idx === 0 ? 'bg-teal hover:bg-teal-dark' : 'bg-orange hover:bg-orange-dark'} py-2.5 px-8.5 rounded-md ease-out duration-200 mt-7.5`}
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
