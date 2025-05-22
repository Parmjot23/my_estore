// src/components/Wishlist/SingleItem.tsx
"use client";
import React, { useState } from "react";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { Product } from "@/types/product"; // Expecting a Product type
import { addItemToCart } from "@/redux/features/cart-slice";
import { removeFromWishlist as apiRemoveFromWishlist } from "@/lib/apiService";
import Image from "next/image";
import Link from "next/link";
import { toast } from 'react-toastify';
// No need to import removeItemFromWishlistAction from Redux slice here if parent handles Redux state update

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/80x70/F0F0F0/777777?text=No+Image";

// Component now expects 'item' to be a Product and 'onRemoveSuccess' to take product ID
const SingleItem = ({ item, onRemoveSuccess }: { item: Product; onRemoveSuccess: (productId: number) => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isRemoving, setIsRemoving] = useState(false);

  if (!item || typeof item.id === 'undefined') {
    console.warn("Wishlist SingleItem rendered with invalid item prop:", item);
    return (
        <div className="flex items-center border-t border-gray-3 py-5 px-4 sm:px-10 text-red-500">
            Error: Invalid product data.
        </div>
    );
  }

  const handleRemoveFromWishlist = async () => {
    setIsRemoving(true);
    try {
      await apiRemoveFromWishlist(item.id); // API uses product ID
      toast.error(`${item.name} removed from wishlist`);
      onRemoveSuccess(item.id); // Notify parent with product ID
    } catch (error: any) {
      toast.error(error.data?.detail || error.message || "Failed to remove item from wishlist.");
      console.error("Wishlist remove error:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  // Calculate effectivePrice based on product's price and discounted_price
  const currentPrice = Number(item.price) || 0;
  const currentDiscountedPrice = item.discounted_price ? (Number(item.discounted_price) || 0) : null;

  const effectivePrice = (currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice)
    ? currentDiscountedPrice
    : currentPrice;

  const isAuthenticated = useAppSelector((state) => state.authReducer.isAuthenticated);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info("Please login to add items to cart.");
      return;
    }
    if (item.is_available) {
      dispatch(
        addItemToCart({
          id: item.id,
          name: item.name,
          price: currentPrice,
          discountedPrice: effectivePrice,
          quantity: 1,
          slug: item.slug,
          cover_image_url: item.cover_image_url,
          imgs: item.imgs,
        } as any)
      );
      toast.success(`${item.name} added to cart`);
    } else {
      toast.warn(`${item.name} is currently out of stock.`);
    }
  };

  const imageUrl = item.cover_image_url || item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || PLACEHOLDER_IMAGE_URL;

  return (
    <div className="flex items-center border-t border-gray-300 dark:border-dark-3 py-5 px-4 sm:px-7.5">
      {/* Remove Button */}
      <div className="flex-shrink-0 w-[50px] sm:w-[83px]">
        <button
          onClick={handleRemoveFromWishlist}
          disabled={isRemoving}
          aria-label="Remove product from wishlist"
          className="flex items-center justify-center rounded-lg w-9 h-9 sm:w-9.5 sm:h-9.5 bg-gray-100 dark:bg-dark-2 border border-gray-300 dark:border-dark-3 text-gray-600 dark:text-gray-400 ease-out duration-200 hover:bg-red-100 hover:border-red-400 hover:text-red-500 dark:hover:bg-red-700/20 dark:hover:border-red-600 dark:hover:text-red-400 disabled:opacity-50"
        >
          {isRemoving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
          ) : (
            <svg className="fill-current" width="18" height="18" viewBox="0 0 22 22"> {/* Adjusted size */}
                <path d="M9.19509 8.22222C8.92661 7.95374 8.49131 7.95374 8.22282 8.22222C7.95433 8.49071 7.95433 8.92601 8.22282 9.1945L10.0284 11L8.22284 12.8056C7.95435 13.074 7.95435 13.5093 8.22284 13.7778C8.49133 14.0463 8.92663 14.0463 9.19511 13.7778L11.0006 11.9723L12.8061 13.7778C13.0746 14.0463 13.5099 14.0463 13.7784 13.7778C14.0469 13.5093 14.0469 13.074 13.7784 12.8055L11.9729 11L13.7784 9.19451C14.0469 8.92603 14.0469 8.49073 13.7784 8.22224C13.5099 7.95376 13.0746 7.95376 12.8062 8.22224L11.0006 10.0278L9.19509 8.22222Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M11.0007 1.14587C5.55835 1.14587 1.14648 5.55773 1.14648 11C1.14648 16.4423 5.55835 20.8542 11.0007 20.8542C16.443 20.8542 20.8548 16.4423 20.8548 11C20.8548 5.55773 16.443 1.14587 11.0007 1.14587ZM2.52148 11C2.52148 6.31713 6.31774 2.52087 11.0007 2.52087C15.6836 2.52087 19.4798 6.31713 19.4798 11C19.4798 15.683 15.6836 19.4792 11.0007 19.4792C6.31774 19.4792 2.52148 15.683 2.52148 11Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0 md:min-w-[330px] xl:min-w-[387px]">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex-shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-dark-2 w-[60px] h-[60px] sm:w-[80px] sm:h-[70px] p-1 overflow-hidden">
            <Image
              src={imageUrl}
              alt={item.name}
              width={70}
              height={70}
              className="object-contain w-full h-full"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;}}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-dark dark:text-white ease-out duration-200 hover:text-blue dark:hover:text-blue text-sm sm:text-base font-medium truncate">
              <Link href={`/shop-details/${item.slug || item.id}`}> {item.name} </Link>
            </h3>
            {/* Display original price if there's a discount */}
            {isAuthenticated && currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-through">${currentPrice.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Unit Price */}
      <div className="hidden sm:block sm:min-w-[150px] md:min-w-[180px] xl:min-w-[205px] px-2 text-center">
        {isAuthenticated && (
          <p className="text-dark dark:text-white font-medium">${effectivePrice.toFixed(2)}</p>
        )}
        {item.get_discount_percentage && item.get_discount_percentage > 0 ? (
          <p className={`font-semibold text-red-600 ${isAuthenticated ? 'mt-1' : ''}`}>{item.get_discount_percentage}% OFF</p>
        ) : (
          !isAuthenticated && <p className="font-semibold text-red-600">Login to see price</p>
        )}
      </div>

      {/* Stock Status */}
      <div className="hidden md:block md:min-w-[200px] xl:min-w-[265px] px-2 text-center">
        <div className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {item.is_available ? "In Stock" : "Out of Stock"}
        </div>
      </div>

      {/* Action (Add to Cart) */}
      <div className="min-w-[120px] sm:min-w-[150px] flex justify-end px-1">
        <button
          onClick={handleAddToCart}
          disabled={!item.is_available || isRemoving}
          className={`inline-flex items-center justify-center text-xs sm:text-sm font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-md ease-out duration-200
            ${item.is_available
              ? 'text-dark dark:text-white hover:text-white bg-gray-100 dark:bg-dark-2 border border-gray-300 dark:border-dark-3 hover:bg-blue dark:hover:bg-blue hover:border-blue dark:hover:border-blue'
              : 'text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-dark-3 border border-gray-300 dark:border-dark-4 cursor-not-allowed'
            } disabled:opacity-60`}
        >
          {item.is_available ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
