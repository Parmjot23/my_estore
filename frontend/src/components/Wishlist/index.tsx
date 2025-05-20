// src/components/Wishlist/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleItem from "./SingleItem";
import Link from "next/link";
import { getWishlist as apiGetWishlist } from "@/lib/apiService";
import { Product, ApiWishlistItem } from "@/types/product";
import { useAppDispatch } from "@/redux/store";
import { setWishlistItems, removeItemFromWishlist as removeItemFromReduxWishlist } from "@/redux/features/wishlist-slice";
import { toast } from "react-toastify";

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchUserWishlist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("[Wishlist] Fetching user wishlist...");
        const apiWishlistItemsResponse: ApiWishlistItem[] = await apiGetWishlist();
        console.log("[Wishlist] API Response received:", apiWishlistItemsResponse);

        if (!Array.isArray(apiWishlistItemsResponse)) {
            console.error("[Wishlist] API did not return an array for wishlist items:", apiWishlistItemsResponse);
            throw new Error("Invalid wishlist data received from server.");
        }

        // Filter out any null or undefined items from the API response itself
        const validApiItems = apiWishlistItemsResponse.filter(item => item != null);

        const productsFromWishlist: Product[] = validApiItems
          .map((item, index) => {
            if (item && item.product_details && typeof item.product_details.id !== 'undefined') {
              const productData = item.product_details;
              // Ensure numeric fields are numbers and provide defaults
              return {
                ...productData,
                id: Number(productData.id),
                price: Number(productData.price) || 0,
                discounted_price: productData.discounted_price ? (Number(productData.discounted_price) || null) : null,
                average_rating: productData.average_rating ? (Number(productData.average_rating) || 0) : 0,
                reviews: Number(productData.reviews) || 0, // Assuming 'reviews' is reviews_count
                stock_quantity: productData.stock_quantity ? Number(productData.stock_quantity) : undefined,
                is_available: typeof productData.is_available === 'boolean' ? productData.is_available : true,
              } as Product;
            }
            console.warn(`[Wishlist] Invalid item structure at index ${index} or missing product_details/id:`, item);
            return null; // Mark for filtering
          })
          // Filter out products that became null during mapping or don't have a valid numeric ID
          .filter(product => product !== null && typeof product.id === 'number') as Product[];

        console.log("[Wishlist] Successfully processed products for display:", productsFromWishlist);

        dispatch(setWishlistItems(productsFromWishlist));
        setDisplayProducts(productsFromWishlist);

      } catch (err: any) {
        console.error("[Wishlist] Full fetch error object:", err);
        const errorMessage = err.data?.detail || err.data?.message || err.message || "Failed to fetch wishlist.";
        setError(errorMessage);
        toast.error(`Wishlist Error: ${errorMessage}`);
        setDisplayProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserWishlist();
  }, [dispatch]);

  const handleItemRemoved = (productId: number) => {
    dispatch(removeItemFromReduxWishlist(productId));
    setDisplayProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  if (isLoading) {
    return (
      <>
        <Breadcrumb pageName={"Wishlist"} />
        <section className="py-10 sm:py-20 bg-gray-100 dark:bg-dark-2 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto my-4"></div>
            Loading wishlist...
        </section>
      </>
    );
  }

  if (error) {
     return (
      <>
        <Breadcrumb pageName={"Wishlist"} />
        <section className="py-10 sm:py-20 bg-gray-100 dark:bg-dark-2 text-center">
            <p className="text-red-500 text-lg font-semibold">Could not load your wishlist.</p>
            <p className="text-red-400 text-sm mt-2">Details: {error}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-4">Please ensure you are logged in and try again. If the issue persists, contact support.</p>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName={"Wishlist"} />
      <section className="overflow-hidden py-10 sm:py-16 lg:py-20 bg-gray-100 dark:bg-dark-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-8">
            <h2 className="font-semibold text-xl sm:text-2xl text-dark dark:text-white">Your Wishlist ({displayProducts.length})</h2>
          </div>

          {displayProducts.length > 0 ? (
            <div className="bg-white dark:bg-dark shadow-lg rounded-lg">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[700px] md:min-w-[900px] xl:min-w-[1170px]">
                  <div className="flex items-center py-4 px-4 sm:px-7.5 border-b border-gray-200 dark:border-dark-3 bg-gray-50 dark:bg-dark-2/30 rounded-t-lg">
                    <div className="flex-shrink-0 w-[50px] sm:w-[83px]"></div>
                    <div className="flex-grow min-w-0 md:min-w-[330px] xl:min-w-[387px]">
                      <p className="text-dark dark:text-gray-300 font-semibold text-sm">Product</p>
                    </div>
                    <div className="hidden sm:block sm:min-w-[150px] md:min-w-[180px] xl:min-w-[205px] px-2 text-center">
                      <p className="text-dark dark:text-gray-300 font-semibold text-sm">Unit Price</p>
                    </div>
                    <div className="hidden md:block md:min-w-[200px] xl:min-w-[265px] px-2 text-center">
                      <p className="text-dark dark:text-gray-300 font-semibold text-sm">Stock Status</p>
                    </div>
                    <div className="min-w-[120px] sm:min-w-[150px] px-1 text-right">
                      <p className="text-dark dark:text-gray-300 font-semibold text-sm">Action</p>
                    </div>
                  </div>

                  {/* Wishlist Items */}
                  {displayProducts.map((product, index) => {
                    // The product here should be valid due to prior filtering.
                    // If product or product.id is still an issue, it implies a deeper problem
                    // with how productsFromWishlist was constructed or data types.
                    if (!product || typeof product.id !== 'number') {
                      console.error(`[Wishlist] CRITICAL: Rendering loop found invalid product at index ${index}:`, product);
                      return (
                        <div key={`render-error-item-${index}`} className="p-4 text-red-700 bg-red-100 border-t border-red-300 dark:border-dark-3">
                          Error: Cannot display this wishlist item due to inconsistent data (ID: {product?.id || 'unknown'}).
                        </div>
                      );
                    }
                    return (
                      <SingleItem
                          item={product}
                          key={`wishlist-item-${product.id}`} // Using a more unique key
                          onRemoveSuccess={handleItemRemoved}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark shadow-lg rounded-lg p-10 text-center">
               <svg className="mx-auto mb-6 text-gray-400 dark:text-gray-500" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor"/></svg>
              <p className="pb-6 text-lg text-gray-700 dark:text-gray-300">Your wishlist is empty.</p>
              <Link
                href="/shop-with-sidebar"
                className="w-full max-w-xs mx-auto flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark transition-colors"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
