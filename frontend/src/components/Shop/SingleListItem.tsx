// frontend/src/components/Shop/SingleListItem.tsx
"use client";
import React, { useEffect, useState } from "react"; // Added useEffect, useState
import { Product } from "@/types/product";
// CORRECTED IMPORT: Ensure this matches the exported name from your context file
import { useQuickViewModalContext } from "@/app/context/QuickViewModalContext";
// Removed updateQuickView as context now handles product slug directly
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice"; // For client-side Redux
import {
    addToWishlist as apiAddToWishlist,
    removeFromWishlist as apiRemoveFromWishlist
} from "@/lib/apiService"; // For API calls
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, useAppSelector } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify"; // For user feedback
import { Heart, Eye, ShoppingCart } from 'lucide-react'; // Lucide icons

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/250x250/F0F0F0/777777?text=No+Image";

// Component expects a prop named 'item'
const SingleListItem = ({ item }: { item: Product }) => {
  // CORRECTED USAGE: Using the correctly imported hook
  const { openModal, setProductSlug } = useQuickViewModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    // Guard against item or item.id being undefined
    if (item && typeof item.id !== 'undefined') {
      setIsWishlisted(wishlistItems.some(wishlistItem => wishlistItem && wishlistItem.id === item.id));
    }
  }, [wishlistItems, item]); // item dependency to re-evaluate if item prop changes


  const handleQuickViewClick = () => { // Renamed from handleQuickViewUpdate for clarity
    if (item && item.slug) {
      setProductSlug(item.slug); // Set slug for the modal to fetch details
      openModal();
    } else {
      toast.error("Product details not available for quick view.");
    }
  };

  const isAuthenticated = useAppSelector((state) => state.authReducer.isAuthenticated);

  const handleAddToCart = () => {
    if (!item) return; // Guard
    if (!isAuthenticated) {
      toast.info("Please login to add items to cart.");
      return;
    }
    if (!item.is_available) {
      toast.warn(`${item.name} is out of stock.`);
      return;
    }
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
        discountedPrice: item.discounted_price ? Number(item.discounted_price) : Number(item.price),
        price: Number(item.price),
      })
    );
    toast.success(`${item.name} added to cart!`);
  };

  const handleToggleWishlist = async () => { // Renamed from handleItemToWishList
    if (!item || typeof item.id === 'undefined') {
        toast.error("Cannot update wishlist: Product ID is missing.");
        return;
    }
    setIsWishlistLoading(true);
    const currentIsWishlisted = wishlistItems.some(wishlistItem => wishlistItem && wishlistItem.id === item.id);

    try {
      if (currentIsWishlisted) {
        await apiRemoveFromWishlist(item.id);
        toast.info(`${item.name} removed from wishlist.`);
        // dispatch(removeItemFromWishlistAction(item.id)); // If using Redux action to sync
        setIsWishlisted(false);
      } else {
        await apiAddToWishlist(item.id);
        toast.success(`${item.name} added to wishlist!`);
        // dispatch(addItemToWishlistAction(item)); // If using Redux action to sync
        setIsWishlisted(true);
      }
    } catch (error: any) {
      toast.error(error.data?.detail || error.message || "Failed to update wishlist.");
      console.error("Wishlist toggle error:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Guard against item being null or undefined before accessing its properties
  if (!item) {
    // Or render a loading/error state for this specific item
    console.warn("SingleListItem rendered with undefined item prop.");
    return null;
  }

  const imageUrl = item.cover_image_url || item.imgs?.previews?.[0] || PLACEHOLDER_IMAGE_URL;
  const rating = item.average_rating ? parseFloat(String(item.average_rating)) : 0;
  const reviewCount = typeof item.reviews_count === 'number' ? item.reviews_count : 0;

  const currentPrice = parseFloat(String(item.price)) || 0;
  const currentDiscountedPrice = item.discounted_price ? parseFloat(String(item.discounted_price)) : null;

  const effectivePrice = (currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice)
    ? currentDiscountedPrice
    : currentPrice;

  const renderStars = () => {
    const stars = [];
    const roundedRating = Math.round(rating);
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

  return (
    <div className="group rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row">
        <div className="relative overflow-hidden flex items-center justify-center sm:max-w-[270px] w-full aspect-square sm:aspect-auto bg-gray-100 p-4 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
          <Link href={`/shop-details/${item.slug}`} className="block w-full h-full">
            <Image
              src={imageUrl}
              alt={item.name || "Product image"}
              width={250} // Adjust as needed for list view
              height={250} // Adjust as needed for list view
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;
              }}
            />
          </Link>
           {item.get_discount_percentage && item.get_discount_percentage > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                {item.get_discount_percentage}% OFF
            </span>
            )}
            {!item.is_available && (
            <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                Out of Stock
            </span>
            )}
        </div>

        <div className="w-full flex flex-col justify-between p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {renderStars()}
              <p className="text-xs text-gray-600">({reviewCount} Reviews)</p>
            </div>
            <h3 className="font-semibold text-base text-dark hover:text-blue transition-colors duration-200 mb-2">
              <Link href={`/shop-details/${item.slug}`} className="line-clamp-2">
                {item.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {item.description || "No description available."}
            </p>
          </div>

          <div className="mt-auto">
            {isAuthenticated && (
              <span className="flex items-center gap-2 font-semibold text-lg mb-3">
                <span
                  className={`${
                    currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice
                      ? 'text-red-600'
                      : 'text-dark'
                  }`}
                >
                  ${effectivePrice.toFixed(2)}
                </span>
                {currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice && (
                  <span className="text-gray-500 line-through text-base">${currentPrice.toFixed(2)}</span>
                )}
              </span>
            )}
            {item.get_discount_percentage && item.get_discount_percentage > 0 ? (
              <span className="inline-block font-semibold text-red-600 bg-red-50 px-2 py-1 rounded mb-3">
                {item.get_discount_percentage}% OFF
              </span>
            ) : (
              !isAuthenticated && (
                <span className="inline-block font-semibold text-red-600 bg-red-50 px-2 py-1 rounded mb-3">
                  Login to see price
                </span>
              )
            )}
            {!item.is_available && (
                <p className="text-xs text-red-500 mb-3 font-medium">Out of Stock</p>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleAddToCart}
                aria-label="Add to cart"
                title="Add to cart"
                disabled={!item.is_available}
                className={`flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 font-medium text-sm py-2 px-4 rounded-md text-white ease-out duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                    item.is_available ? 'bg-blue hover:bg-blue-dark focus:ring-blue' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={16}/> Add to Cart
              </button>
              <button
                onClick={handleQuickViewClick}
                aria-label="Quick view product"
                title="Quick view"
                className="flex items-center justify-center p-2 rounded-md shadow-sm text-dark bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-opacity-50 transition-colors"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={isWishlistLoading}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`flex items-center justify-center p-2 rounded-md shadow-sm text-dark bg-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                    isWishlisted ? 'hover:bg-red-100 focus:ring-red-400' : 'hover:bg-red-100 focus:ring-red-500' // Consistent hover for wishlist
                } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;