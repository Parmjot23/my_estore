// frontend/src/components/Home/Categories/SingleItem.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category as CategoryType } from '@/types/product'; // Using the richer Category type

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/82x62/F2F3F8/3C50E0?text=No+Image";

const SingleItem = ({ item }: { item: CategoryType }) => {
  const imageUrl = item.image_url || item.image || PLACEHOLDER_IMAGE_URL; // Use image_url or fallback to image

  return (
    // Ensure the link points to the shop page with the category slug as a query parameter
    <Link href={`/shop-with-sidebar?category__slug=${item.slug}`} className="group flex flex-col items-center text-center">
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 overflow-hidden">
        <Image
          src={imageUrl}
          alt={item.name || "Category"}
          width={82}
          height={62}
          unoptimized
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;
          }}
        />
      </div>
      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
          {item.name}
        </h3>
        {/* Optionally display product count if available and desired here */}
        {/* {typeof item.product_count === 'number' && (
          <span className="text-xs text-gray-500 ml-1">({item.product_count})</span>
        )} */}
      </div>
    </Link>
  );
};

export default SingleItem;