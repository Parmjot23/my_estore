// frontend/src/components/Home/BestSeller/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem"; // Uses the updated SingleItem for BestSellers
import Image from "next/image";
import Link from "next/link";
import { getProducts , PaginatedProducts } from "@/lib/apiService"; // Import getProducts
import { Product as ProductType } from "@/types/product"; // Import ProductType

const BestSeller = () => {
  const [bestSellerProducts, setBestSellerProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBestSellers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('is_best_seller', 'true'); // Filter by best sellers
        params.append('limit', '6'); // Show up to 6 best sellers on the home page

        const paginatedData: PaginatedProducts = await getProducts (params);
        setBestSellerProducts(paginatedData.results || []);
      } catch (err) {
        console.error("Failed to fetch best seller products:", err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred fetching best sellers.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBestSellers();
  }, []);

  if (isLoading) {
    return (
      <section className="overflow-hidden py-12">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-10 text-center">
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Loading Best Sellers...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden py-12">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-10 text-center">
            <h2 className="font-semibold text-xl xl:text-heading-5 text-red-500">Error Loading Best Sellers</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (bestSellerProducts.length === 0 && !isLoading) {
    return (
      <section className="overflow-hidden py-12">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-10 text-center">
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Best Sellers</h2>
             <p className="text-gray-600 mt-2">No best-selling products to display at the moment.</p>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="overflow-hidden py-12 bg-gray-50"> {/* Added a light background */}
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-10 flex flex-col items-center text-center">
            <span className="flex items-center gap-2.5 font-medium text-blue mb-2"> {/* Changed color for emphasis */}
              <Image
                src="/images/icons/icon-07.svg" // Make sure this icon exists or use a different one
                alt="icon"
                width={20}
                height={20}
              />
              This Month's
            </span>
            <h2 className="font-bold text-2xl xl:text-heading-4 text-dark">
              Top Sellers
            </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {bestSellerProducts.map((item) => (
            <SingleItem item={item} key={item.id} />
          ))}
        </div>

        {bestSellerProducts.length > 0 && ( // Only show View All if there are products
            <div className="text-center mt-12.5">
            <Link
                href="/shop-with-sidebar?ordering=-average_rating" // Example: link to shop sorted by rating or a dedicated bestsellers page
                className="inline-flex font-medium text-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-300 border bg-white text-dark shadow-sm hover:bg-blue hover:text-white hover:border-blue transition-colors duration-200"
            >
                View All Products
            </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default BestSeller;
