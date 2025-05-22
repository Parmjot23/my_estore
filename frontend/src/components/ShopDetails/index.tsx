// src/components/ShopDetails/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { Product, ProductMediaItem } from "@/types/product";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist as addItemToWishlistAction } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details"; // For PreviewSliderModal
import { toast } from "react-toastify";
import Link from "next/link"; // Import Link

// API service imports for reviews
import { getProductReviews, createProductReview } from "@/lib/apiService";
import { Review } from "@/types/product";


const PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400/eee/ccc?text=No+Image";

interface ShopDetailsProps {
  product: Product;
}

const ShopDetails = ({ product }: ShopDetailsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider(); // Context hook for opening modal
  const [previewImgIndex, setPreviewImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");
  const [activeColor, setActiveColor] = useState(product?.color || "blue"); // Default to product color or blue

  // State for reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // State for new review form
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewUserName, setNewReviewUserName] = useState(""); // For guest reviews
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);


  // Fetch reviews when the product changes or component mounts
  useEffect(() => {
    if (product && product.slug) {
      setIsLoadingReviews(true);
      setReviewError(null);
      getProductReviews(product.slug)
        .then(data => setReviews(data || []))
        .catch(err => {
          console.error("Failed to fetch reviews:", err);
          setReviewError(err.message || "Could not load reviews.");
        })
        .finally(() => setIsLoadingReviews(false));
    }
  }, [product]);


  if (!product) {
    // This case should ideally be handled by the parent page component (SSR/SSG)
    // but as a fallback:
    return (
      <>
        <Breadcrumb title={"Product Not Found"} pages={["Shop", "Error"]} />
        <div className="py-20 text-center text-dark dark:text-white">Product details are unavailable.</div>
      </>
    );
  }

  // Image handling logic
  let displayImages: string[] = [];
  if (product.product_media && product.product_media.length > 0) {
    displayImages = product.product_media
      .filter(media => media.media_type === 'IMG' && media.file_url && media.file_url.trim() !== "")
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(media => media.file_url as string);
  }
  if (displayImages.length === 0 && product.cover_image_url && product.cover_image_url.trim() !== "") {
    displayImages.push(product.cover_image_url);
  }
  if (displayImages.length === 0 && product.imgs?.previews && product.imgs.previews.length > 0) {
    const validPreviews = product.imgs.previews.filter(url => url && url.trim() !== "");
    if (validPreviews.length > 0) {
        imagesForSlider = validPreviews;
    }
  }

  // Fallback if no images are found after all checks
  if (displayImages.length === 0) {
    displayImages.push(PLACEHOLDER_IMAGE_URL);
  }


  const currentPreviewImage = displayImages[previewImgIndex] || PLACEHOLDER_IMAGE_URL;
  const thumbnailImages = product.product_media?.filter(m => m.media_type === 'IMG' && m.is_thumbnail && m.file_url).map(m => m.file_url as string) || (displayImages.length > 1 ? displayImages.slice(0,5) : []);


  const handlePreviewSlider = () => {
    if (displayImages.length > 0) {
      // Dispatch action to update Redux state for PreviewSliderModal
      dispatch(updateproductDetails(product));
      openPreviewModal(); // This just toggles visibility
    }
  };

  const effectivePrice = (product.discounted_price != null && Number(product.discounted_price) < Number(product.price))
    ? Number(product.discounted_price)
    : Number(product.price);

  const reviewCount = product.reviews || 0; // Using 'reviews' as per Product type
  const averageRating = product.average_rating ? Number(product.average_rating) : 0;

  const isAuthenticated = useAppSelector((state) => state.authReducer.isAuthenticated);

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
    toast.success(`${product.name} (x${quantity}) added to cart`);
  };

  const handleAddToWishlist = () => {
    if (product) {
      dispatch(addItemToWishlistAction(product));
      toast.info(`${product.name} added to wishlist`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewRating || !newReviewComment.trim() || !newReviewUserName.trim()) {
        toast.error("Please provide a rating, comment, and your name.");
        return;
    }
    setIsSubmittingReview(true);
    try {
        const reviewData = {
            rating: newReviewRating,
            comment: newReviewComment,
            user_name: newReviewUserName,
        };
        const newReview = await createProductReview(product.id, reviewData); // Assuming product.id is number
        setReviews(prevReviews => [newReview, ...prevReviews]);
        toast.success("Review submitted successfully!");
        setNewReviewRating(0);
        setNewReviewComment("");
        setNewReviewUserName("");
        // Optionally, refetch the product to update average_rating and reviews_count if backend recalculates it
    } catch (err: any) {
        toast.error(err.data?.detail || err.message || "Failed to submit review.");
        console.error("Review submission error:", err);
    } finally {
        setIsSubmittingReview(false);
    }
  };


  const tabs = [
    { id: "tabOne", title: "Description" },
    { id: "tabTwo", title: "Additional Information" },
    { id: "tabThree", title: `Reviews (${reviewCount})` }
  ];
  const colors = product.product_media?.filter(m => m.alt_text?.toLowerCase().includes("color")).map(m => m.alt_text?.split(': ')[1]) || ["blue", "red", "green"]; // Example fallback

  return (
    <>
      <Breadcrumb title={product.name || "Shop Details"} pages={["Shop", product.name || "Details"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Image Gallery Section */}
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 dark:bg-dark-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                {displayImages.length > 0 ? (
                  <>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="Zoom image"
                      className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 dark:bg-dark shadow-1 flex items-center justify-center ease-out duration-200 text-dark dark:text-white hover:text-primary dark:hover:text-primary absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                    >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22"><path fillRule="evenodd" clipRule="evenodd" d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z" /></svg>
                    </button>
                    <Image
                      src={currentPreviewImage}
                      alt={product.name || "Product image"}
                      width={400}
                      height={400}
                      className="rounded-lg object-contain max-h-[450px]"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL; }}
                      priority={true}
                    />
                  </>
                ) : (
                  <Image src={PLACEHOLDER_IMAGE_URL} alt="Product image placeholder" width={400} height={400} className="rounded-lg object-contain max-h-[450px]" />
                )}
              </div>

              {thumbnailImages.length > 0 && (
                <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4.5 mt-6">
                  {thumbnailImages.slice(0, 5).map((imgSrc, key) => (
                    <button
                      onClick={() => setPreviewImgIndex(key)}
                      key={key}
                      className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-md bg-gray-1 dark:bg-dark shadow-sm ease-out duration-200 border-2 hover:border-primary dark:hover:border-primary ${
                        key === previewImgIndex
                          ? "border-primary dark:border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        width={70}
                        height={70}
                        src={imgSrc || PLACEHOLDER_IMAGE_URL}
                        alt={`Thumbnail ${key + 1}`}
                        className="object-contain w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Content Section */}
            <div className="max-w-[539px] w-full">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark dark:text-white">
                  {product.name || "Product Name"}
                </h2>
                {product.get_discount_percentage != null && product.get_discount_percentage > 0 && (
                    <div className="ml-2 inline-flex font-medium text-xs sm:text-custom-sm text-white bg-red-500 rounded py-0.5 px-2 sm:px-2.5 whitespace-nowrap">
                        {product.get_discount_percentage.toFixed(0)}% OFF
                    </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-6"} />
                    ))}
                  </div>
                  <span className="text-sm text-dark-5 dark:text-dark-6"> ({reviewCount} customer review{reviewCount !== 1 ? 's' : ''}) </span>
                </div>
                {product.is_available !== undefined && (
                    <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${product.is_available ? "bg-green" : "bg-red-500"}`}></div>
                        <span className={`text-sm ${product.is_available ? "text-green" : "text-red-500"}`}> {product.is_available ? "In Stock" : "Out of Stock"} </span>
                    </div>
                )}
              </div>

              <h3 className="font-semibold text-2xl sm:text-3xl mb-5">
                <span className={`text-dark dark:text-white ${(product.discounted_price != null && Number(product.discounted_price) < Number(product.price)) ? 'text-red-500' : 'text-primary'}`}>
                    ${effectivePrice.toFixed(2)}
                </span>
                {product.discounted_price != null && Number(product.discounted_price) < Number(product.price) && (
                    <span className="ml-2 text-lg line-through text-gray-500 dark:text-dark-6">
                    ${Number(product.price).toFixed(2)}
                    </span>
                )}
              </h3>

              <p className="text-body-color dark:text-dark-6 mb-6 text-sm leading-relaxed line-clamp-4">
                {product.description?.substring(0, 200) || "No short description available."}
                {product.description && product.description.length > 200 && "..."}
              </p>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-4.5 border-y border-gray-3 dark:border-dark-3 mt-7.5 mb-9 py-7">
                  {/* Color Selector (Example) */}
                  {product.color && (
                    <div className="flex items-center gap-4">
                        <div className="min-w-[65px]"><h4 className="font-medium text-dark dark:text-white">Color:</h4></div>
                        <div className="flex items-center gap-2.5">
                            {/* If product.color is a string, show it. If it's an array of colors, map them. */}
                            {[product.color].map((colorItem, key) => (
                                <label key={key} htmlFor={colorItem} className="cursor-pointer select-none flex items-center">
                                    <div className="relative">
                                        <input type="radio" name="color" id={colorItem} className="sr-only" onChange={() => setActiveColor(colorItem)} checked={activeColor === colorItem} />
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${activeColor === colorItem ? "ring-2 ring-offset-1 dark:ring-offset-dark-2" : ""}`} style={{ borderColor: activeColor === colorItem ? colorItem : 'transparent', backgroundColor: colorItem }}>
                                            {activeColor === colorItem && <span className="block w-2.5 h-2.5 rounded-full bg-white dark:bg-dark-3"></span>}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                  )}
                  {/* Add other variant selectors (Size, Storage, etc.) if they exist in product data */}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4.5">
                    <div className="flex items-center rounded-md border border-gray-3 dark:border-dark-3">
                        <button aria-label="Decrease quantity" className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 ease-out duration-200 hover:text-primary dark:text-white dark:hover:text-primary disabled:opacity-50" onClick={() => quantity > 1 && setQuantity(quantity - 1)} disabled={quantity <=1}>
                            <svg className="fill-current" width="18" height="18" viewBox="0 0 20 20"><path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" /></svg>
                        </button>
                        <input type="number" value={quantity} readOnly className="w-12 sm:w-16 h-10 sm:h-12 text-center border-x border-gray-3 dark:border-dark-3 bg-transparent text-dark dark:text-white focus:outline-none" />
                        <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 ease-out duration-200 hover:text-primary dark:text-white dark:hover:text-primary">
                            <svg className="fill-current" width="18" height="18" viewBox="0 0 20 20"><path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" /><path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" /></svg>
                        </button>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 inline-flex items-center justify-center font-medium text-white bg-primary py-3 px-5 sm:px-7 rounded-md ease-out duration-200 hover:bg-primary/90 disabled:bg-gray-400 dark:disabled:bg-dark-4"
                        disabled={!product.is_available}
                    >
                        {product.is_available ? "Add to Cart" : "Out of Stock"}
                    </button>
                     <button
                        onClick={handleAddToWishlist}
                        aria-label="Add to wishlist"
                        className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 dark:border-dark-3 ease-out duration-200 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 hover:border-transparent text-dark dark:text-white"
                    >
                        <Heart size={20} />
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="overflow-hidden bg-gray-1 dark:bg-dark-3 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white dark:bg-dark-2 rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6 mb-10">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`font-medium text-sm sm:text-base lg:text-lg ease-out duration-200 hover:text-primary relative before:h-0.5 before:bg-primary before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${
                  activeTab === item.id
                    ? "text-primary before:w-full"
                    : "text-dark dark:text-white before:w-0"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className={`p-6 sm:p-8 bg-white dark:bg-dark-2 rounded-lg shadow-1 ${activeTab === "tabOne" ? "block" : "hidden"}`}>
            <h2 className="font-semibold text-xl sm:text-2xl text-dark dark:text-white mb-6">Product Description</h2>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-body-color dark:text-dark-6 whitespace-pre-line">
                {product.description || "No detailed description available for this product."}
            </div>
          </div>

          <div className={`p-6 sm:p-8 bg-white dark:bg-dark-2 rounded-lg shadow-1 ${activeTab === "tabTwo" ? "block" : "hidden"}`}>
             <h2 className="font-semibold text-xl sm:text-2xl text-dark dark:text-white mb-6">Additional Information</h2>
             <div className="space-y-3">
                <div className="flex py-2 border-b border-gray-200 dark:border-dark-4"><p className="w-1/3 font-medium text-dark dark:text-white">Brand</p><p className="w-2/3 text-body-color dark:text-dark-6">{product.brand_details?.name || 'N/A'}</p></div>
                <div className="flex py-2 border-b border-gray-200 dark:border-dark-4"><p className="w-1/3 font-medium text-dark dark:text-white">Category</p><p className="w-2/3 text-body-color dark:text-dark-6">{product.category_details?.name || 'N/A'}</p></div>
                {product.sku && (<div className="flex py-2 border-b border-gray-200 dark:border-dark-4"><p className="w-1/3 font-medium text-dark dark:text-white">SKU</p><p className="w-2/3 text-body-color dark:text-dark-6">{product.sku}</p></div>)}
                {product.color && (<div className="flex py-2 border-b border-gray-200 dark:border-dark-4"><p className="w-1/3 font-medium text-dark dark:text-white">Color</p><p className="w-2/3 text-body-color dark:text-dark-6">{product.color}</p></div> )}
                {product.material && (<div className="flex py-2 border-b border-gray-200 dark:border-dark-4"><p className="w-1/3 font-medium text-dark dark:text-white">Material</p><p className="w-2/3 text-body-color dark:text-dark-6">{product.material}</p></div>)}
                {product.size && (<div className="flex py-2"><p className="w-1/3 font-medium text-dark dark:text-white">Size</p><p className="w-2/3 text-body-color dark:text-dark-6">{product.size}</p></div>)}
             </div>
          </div>

          <div className={`p-6 sm:p-8 bg-white dark:bg-dark-2 rounded-lg shadow-1 ${activeTab === "tabThree" ? "block" : "hidden"}`}>
            <h2 className="font-semibold text-xl sm:text-2xl text-dark dark:text-white mb-7">
                {reviewCount} Review{reviewCount !== 1 ? 's' : ''} for {product.name}
            </h2>
            {isLoadingReviews && <p>Loading reviews...</p>}
            {reviewError && <p className="text-red-500">{reviewError}</p>}
            {!isLoadingReviews && !reviewError && reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-dark-4 pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-3 dark:bg-dark-4 flex items-center justify-center text-dark dark:text-white font-semibold">
                                        {review.user_name ? review.user_name.substring(0, 2).toUpperCase() : 'GU'}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-dark dark:text-white">{review.user_name || 'Guest'}</h4>
                                        <p className="text-xs text-body-color dark:text-dark-6">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-6"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-body-color dark:text-dark-6 text-sm whitespace-pre-line">{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoadingReviews && <p className="text-body-color dark:text-dark-6">No reviews yet for this product.</p>
            )}
            <div className="mt-10">
                <h3 className="font-semibold text-lg text-dark dark:text-white mb-4">Add a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                        <input type="text" id="user_name" value={newReviewUserName} onChange={(e) => setNewReviewUserName(e.target.value)} required className="form-input w-full max-w-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating</label>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setNewReviewRating(star)} className="focus:outline-none">
                                    <Star size={24} className={`${newReviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'} mr-1 transition-colors`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review</label>
                        <textarea id="comment" value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} rows={4} required className="form-input w-full"></textarea>
                    </div>
                    <button type="submit" disabled={isSubmittingReview} className="btn-primary">
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewdItems />
      <Newsletter />
       <style jsx>{`
        .form-input {
          @apply block w-full px-3 py-2 text-sm text-dark dark:text-white bg-white dark:bg-dark border border-gray-300 dark:border-dark-3 rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue transition-colors;
        }
         .btn-primary {
          @apply inline-flex items-center justify-center px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue dark:focus:ring-offset-dark transition-all duration-150 ease-in-out disabled:opacity-70;
        }
      `}</style>
    </>
  );
};

export default ShopDetails;