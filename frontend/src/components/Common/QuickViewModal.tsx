// frontend/src/components/Common/QuickViewModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuickViewModalContext } from "@/app/context/QuickViewModalContext";
import { Product } from "@/types/product";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { toast } from "react-toastify";
import PreviewSlider from "./PreviewSlider"; // Assuming this component is correctly implemented
import { getProductBySlug } from "@/lib/apiService";
import { Star, Heart, ShoppingCart, XCircle, RefreshCw } from "lucide-react"; // Lucide icons

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400/eee/ccc?text=No+Image";

const QuickViewModal = () => {
  const { isQuickViewModalOpen, closeModal, productSlug, setProductSlug: setContextProductSlug } =
    useQuickViewModalContext();

  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useAppSelector((state) => state.authReducer.isAuthenticated);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productSlug && isQuickViewModalOpen) {
      setLoading(true);
      setError(null);
      setProduct(null); // Reset previous product
      getProductBySlug(productSlug)
        .then(data => {
          setProduct(data);
          setQuantity(1); // Reset quantity when new product loads
        })
        .catch(err => {
          console.error("QuickViewModal: Error fetching product details:", err);
          setError(err.data?.detail || err.message || "Failed to load product details.");
        })
        .finally(() => setLoading(false));
    }
  }, [productSlug, isQuickViewModalOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content-quickview")) {
        closeModal();
      }
    }

    if (isQuickViewModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setQuantity(1);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isQuickViewModalOpen, closeModal]);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.info("Please login to add items to cart.");
      return;
    }
    if (!product.is_available) {
      toast.warn(`${product.name} is out of stock.`);
      return;
    }
    dispatch(
      addItemToCart({
        ...product,
        quantity,
        discountedPrice: effectivePrice,
        price: Number(product.price),
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  const handleAddToWishlist = () => {
    if (product) {
      dispatch(addItemToWishlist(product));
      toast.info(`${product.name} added to wishlist`);
    }
  };

  const handleModalClose = () => {
    setContextProductSlug(null);
    closeModal();
  }

  if (!isQuickViewModalOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="text-white text-xl p-8 bg-dark-2 rounded-lg flex items-center">
          <RefreshCw size={24} className="animate-spin mr-3" />
          Loading product...
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="bg-white dark:bg-dark p-8 rounded-lg shadow-xl text-center max-w-md w-full modal-content-quickview">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Error</h3>
            <p className="text-body-color dark:text-dark-6 mb-6">{error}</p>
            <button
                onClick={handleModalClose}
                className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
         <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white dark:bg-dark p-8 rounded-lg shadow-xl text-center max-w-md w-full modal-content-quickview">
                <h3 className="text-xl font-semibold mb-4 text-dark dark:text-white">Product Not Available</h3>
                <p className="text-body-color dark:text-dark-6 mb-6">
                    The product details could not be loaded or the product does not exist.
                </p>
                <button
                    onClick={handleModalClose}
                    className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
  }

  // --- IMAGE SOURCE LOGIC ---
  // If you are using external image URLs, ensure the hostnames are configured in your next.config.js
  // Example: images: { remotePatterns: [{ protocol: 'https', hostname: 'example.com' }] }
  let imagesForSlider: string[] = [];
  if (product.product_media && product.product_media.length > 0) {
    imagesForSlider = product.product_media
      .filter(media => media.media_type === 'IMG' && media.file_url && media.file_url.trim() !== "")
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(media => media.file_url as string);
  }
  if (imagesForSlider.length === 0 && product.cover_image_url && product.cover_image_url.trim() !== "") {
    imagesForSlider.push(product.cover_image_url);
  }
  if (imagesForSlider.length === 0 && product.imgs?.previews && product.imgs.previews.length > 0) {
    const validPreviews = product.imgs.previews.filter(url => url && url.trim() !== "");
    if (validPreviews.length > 0) {
        imagesForSlider = validPreviews;
    }
  }
  // --- END OF IMAGE SOURCE LOGIC ---

  // --- PRICE VALIDATION AND CALCULATION ---
  const basePrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price));
  const currentPrice = !isNaN(basePrice) ? basePrice : 0;

  let currentDiscountedPrice: number | null = null;
  if (product.discounted_price != null) {
    const discPrice = typeof product.discounted_price === 'number' ? product.discounted_price : parseFloat(String(product.discounted_price));
    if (!isNaN(discPrice)) {
      currentDiscountedPrice = discPrice;
    }
  }

  const effectivePrice = (currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice)
    ? currentDiscountedPrice
    : currentPrice;
  // --- END OF PRICE VALIDATION ---

  const reviewCount = product.reviews_count || 0;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto transition-opacity duration-300 ease-in-out p-4 ${
        isQuickViewModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-60"
        onClick={handleModalClose}
      ></div>
      <div
        className={`relative z-10 w-full max-w-3xl xl:max-w-4xl rounded-lg bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out dark:bg-dark-2 md:p-8 modal-content-quickview`}
      >
        <button
          onClick={handleModalClose}
          className="absolute right-3 top-3 z-20 text-2xl text-dark-6 hover:text-primary dark:text-white dark:hover:text-primary"
          aria-label="Close quick view"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Product Images Display */}
          <div className="relative">
            {imagesForSlider && imagesForSlider.length > 1 ? (
                // Use PreviewSlider for multiple images
                <PreviewSlider images={imagesForSlider} />
            ) : imagesForSlider && imagesForSlider.length === 1 ? (
                // Use Next/Image directly for a single image
                <Image
                    src={imagesForSlider[0]}
                    alt={product.name || "Product image"}
                    width={600}
                    height={400}
                    className="h-auto w-full rounded-lg object-cover"
                    onError={(e) => {
                        // Fallback to placeholder if the single product image fails to load
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;
                        (e.target as HTMLImageElement).alt = product.name || "Product image placeholder";
                    }}
                 />
            ) : (
                // No product images found, use placeholder
                 <Image
                    src={PLACEHOLDER_IMAGE_URL}
                    alt={product.name || "Product image placeholder"}
                    width={600}
                    height={400}
                    className="h-auto w-full rounded-lg object-cover"
                    // No onError needed here as it's already the placeholder
                 />
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-2 text-xl font-bold text-dark dark:text-white sm:text-2xl">
              {product.name || "Product Name Not Available"}
            </h2>

            <div className="flex items-center mb-3 space-x-2">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.round(product.average_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-dark-6">({reviewCount} Reviews)</span>
            </div>

            <p className="mb-3 text-lg font-semibold">
              {isAuthenticated ? (
                <>
                  <span
                    className={`${
                      currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice
                        ? 'text-red-500'
                        : 'text-primary'
                    }`}
                  >
                     ${effectivePrice.toFixed(2)}
                  </span>
                  {currentDiscountedPrice !== null && currentDiscountedPrice < currentPrice && (
                    <span className="ml-2 text-base text-body-color line-through dark:text-dark-6">
                      ${currentPrice.toFixed(2)}
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-block font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                  {product.get_discount_percentage && product.get_discount_percentage > 0
                    ? `${product.get_discount_percentage}% OFF`
                    : 'Login to see price'}
                </span>
              )}
            </p>

            <p className="mb-4 text-sm text-body-color dark:text-dark-6 line-clamp-3">
              {product.description || "No description available."}
            </p>

            <div className="mb-5 flex items-center space-x-3">
              <div className="flex w-max items-center rounded-md border border-stroke px-3 py-2 dark:border-dark-3">
                <button
                  onClick={handleDecrement}
                  className="text-lg text-primary hover:opacity-75 disabled:opacity-50"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-10 border-0 bg-transparent p-0 text-center text-base text-dark focus:outline-none focus:ring-0 dark:text-white"
                  aria-label="Current quantity"
                />
                <button
                  onClick={handleIncrement}
                  className="text-lg text-primary hover:opacity-75"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className={`flex-1 rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors
                  ${!product.is_available ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
              >
                {product.is_available ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={handleAddToWishlist}
                title="Add to Wishlist"
                className="rounded-md border border-stroke p-2.5 text-dark hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3 transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart size={18} />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              {product.sku && (
                <p className="text-body-color dark:text-dark-6">
                  <span className="font-semibold text-dark dark:text-white">SKU:</span> {product.sku}
                </p>
              )}
              {product.category_details && (
                <p className="text-body-color dark:text-dark-6">
                  <span className="font-semibold text-dark dark:text-white">Category:</span>{" "}
                  <Link href={`/shop-with-sidebar?category=${product.category_details.slug}`} className="hover:text-primary transition-colors" onClick={handleModalClose}>
                     {product.category_details.name}
                  </Link>
                </p>
              )}
               {product.brand_details && (
                <p className="text-body-color dark:text-dark-6">
                  <span className="font-semibold text-dark dark:text-white">Brand:</span>{" "}
                   <Link href={`/shop-with-sidebar?brand=${product.brand_details.slug}`} className="hover:text-primary transition-colors" onClick={handleModalClose}>
                     {product.brand_details.name}
                   </Link>
                </p>
              )}
            </div>

            <div className="mt-5">
              <Link
                href={`/shop-details/${product.slug}`}
                onClick={handleModalClose}
                className="text-sm font-medium text-primary hover:underline"
              >
                View Full Product Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
