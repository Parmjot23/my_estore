// frontend/src/components/Common/ProductItem.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useQuickViewModalContext } from "@/app/context/QuickViewModalContext";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import {
    addToWishlist as apiAddToWishlist,
    removeFromWishlist as apiRemoveFromWishlist,
    addToCart as apiAddToCart,
} from "@/lib/apiService";
import { toast } from "react-toastify";
import Link from "next/link";
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import DiscountBadge from "./DiscountBadge";

const PLACEHOLDER_IMAGE_URL = "/images/no-image.svg";

const ProductItem = ({ item }: { item: Product }) => {
  // ADD THIS CONSOLE.LOG
  // console.log("ProductItem received item:", JSON.stringify(item, null, 2));

  const { openModal, setProductSlug } = useQuickViewModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(wishlistItems.some(wishlistItem => wishlistItem.id === item.id));
  }, [wishlistItems, item.id]);

  const handleQuickViewClick = () => {
    if (item.slug) {
      setProductSlug(item.slug);
      openModal();
    } else {
      toast.error("Product details not available for quick view.");
    }
  };

  const isAuthenticated = useAppSelector((state) => state.authReducer.isAuthenticated);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to add items to cart.");
      return;
    }
    if (!item.is_available) {
      toast.warn(`${item.name} is out of stock.`);
      return;
    }
    try {
      await apiAddToCart(item.id, 1);
      dispatch(
        addItemToCart({
          ...item,
          quantity: 1,
          discountedPrice: item.discounted_price ? Number(item.discounted_price) : Number(item.price),
          price: Number(item.price),
        }) as any
      );
      toast.success(`${item.name} added to cart!`);
    } catch (error: any) {
      toast.error(error.data?.detail || error.message || "Failed to add to cart.");
    }
  };

  const handleToggleWishlist = async () => {
    if (!item || typeof item.id === 'undefined') {
        toast.error("Cannot update wishlist: Product ID is missing.");
        return;
    }
    setIsWishlistLoading(true);
    const currentIsWishlisted = wishlistItems.some(wishlistItem => wishlistItem.id === item.id);

    try {
      if (currentIsWishlisted) {
        await apiRemoveFromWishlist(item.id);
        toast.info(`${item.name} removed from wishlist.`);
        setIsWishlisted(false);
      } else {
        await apiAddToWishlist(item.id);
        toast.success(`${item.name} added to wishlist!`);
        setIsWishlisted(true);
      }
    } catch (error: any) {
      toast.error(error.data?.detail || error.message || "Failed to update wishlist. Please try again.");
      console.error("Wishlist toggle error:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const imageUrl = item.cover_image_url || item.imgs?.previews?.[0] || PLACEHOLDER_IMAGE_URL;

  // Ensure rating is a number, default to 0 if not or undefined
  const rating = (typeof item.average_rating === 'number' && !isNaN(item.average_rating))
    ? item.average_rating
    : 0;

  // Ensure reviewCount is a number, default to 0
  const reviewCount = (typeof item.reviews === 'number' && !isNaN(item.reviews))
    ? item.reviews
    : 0;

  // Debugging: Log the processed rating and reviewCount
  // console.log(`Product: ${item.name}, Original Reviews: ${item.reviews}, Processed Review Count: ${reviewCount}`);
  // console.log(`Product: ${item.name}, Original Avg Rating: ${item.average_rating}, Processed Rating: ${rating}`);


  const renderStars = () => {
    const stars = [];
    const roundedRating = Math.round(rating); // Use the processed rating
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          src={i <= roundedRating ? "/images/icons/icon-star.svg" : "/images/icons/icon-star-gray.svg"}
          alt="star icon"
          width={14}
          height={14}
        />
      );
    }
    return stars;
  };

  const currentPrice = parseFloat(String(item.price)) || 0;
  const currentDiscountedPrice = item.discounted_price ? parseFloat(String(item.discounted_price)) : null;

  const effectivePrice = (currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice)
    ? currentDiscountedPrice
    : currentPrice;

  return (
    <div className="group flex flex-col h-full rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden">
      <div className="relative overflow-hidden flex items-center justify-center bg-gray-100 aspect-square w-full">
        <Link
          href={`/shop-details/${encodeURIComponent(item.slug)}`}
          className="block w-full h-full"
        >
          <Image
            src={imageUrl}
            alt={item.name || "Product image"}
            width={250}
            height={250}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;
            }}
            priority={false} // Generally false for list items, true for LCP images
          />
        </Link>
        {Number(item.get_discount_percentage) > 0 && (
          <DiscountBadge
            percentage={Number(item.get_discount_percentage)}
            className="absolute top-3 right-3"
          />
        )}
        {!item.is_available && (
          <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
            Out of Stock
          </span>
        )}
        {item.is_available && (
            <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-4 pt-2 bg-gradient-to-t from-black/40 via-black/20 to-transparent ease-in-out duration-300 group-hover:translate-y-0 transition-transform">
                <button
                    onClick={handleQuickViewClick}
                    aria-label="Quick view product"
                    title="Quick view"
                    className="flex items-center justify-center w-9 h-9 rounded-full shadow-md ease-out duration-200 text-dark bg-white hover:text-white hover:bg-blue focus:outline-none focus:ring-2 focus:ring-blue focus:ring-opacity-50 transition-colors"
                >
                    <Eye size={16} />
                </button>
                <button
                    onClick={handleAddToCart}
                    aria-label="Add to cart"
                    title="Add to cart"
                    disabled={!item.is_available}
                    className={`flex-grow inline-flex items-center justify-center gap-1 font-medium text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-md text-white ease-out duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                        item.is_available ? 'bg-blue hover:bg-blue-dark focus:ring-blue' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                   <ShoppingCart size={16}/> Add
                </button>
                <button
                    onClick={handleToggleWishlist}
                    disabled={isWishlistLoading}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md text-dark bg-white hover:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                        isWishlisted ? 'hover:bg-red-400 focus:ring-red-400' : 'hover:bg-red-500 focus:ring-red-500'
                    } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}/>
                </button>
            </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 mb-1.5">
          {renderStars()}
          {/* Display the processed reviewCount */}
          <p className="text-xs text-gray-600">({reviewCount})</p>
        </div>
        <h3 className="font-semibold text-sm text-dark hover:text-blue transition-colors duration-200 mb-1.5 flex-grow">
          <Link
            href={`/shop-details/${encodeURIComponent(item.slug)}`}
            className="line-clamp-2"
          >
            {item.name}
          </Link>
        </h3>
        <div className="mt-auto">
          {isAuthenticated ? (
            <span className="flex items-center gap-2 font-semibold text-base">
              <span className={`${currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice ? 'text-red-600' : 'text-dark'}`}>${effectivePrice.toFixed(2)}</span>
              {currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice && (
                <span className="text-gray-500 line-through text-sm">${currentPrice.toFixed(2)}</span>
              )}
            </span>
          ) : (
            <span className="inline-block font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              {Number(item.get_discount_percentage) > 0
                ? `${item.get_discount_percentage}% OFF`
                : 'Login to see price'}
            </span>
          )}
          {!item.is_available && (
            <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;