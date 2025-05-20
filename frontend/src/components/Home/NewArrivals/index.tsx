// frontend/src/components/Home/NewArrivals/index.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { getProducts, PaginatedProducts, GetProductsParams } from '@/lib/apiService'; // Corrected import
import { Product as ProductType } from '@/types/product';

const NewArrival = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: GetProductsParams = {
          ordering: '-created_at', // Order by newest first
          is_new_arrival: true,    // Filter by new arrivals
          page_size: 8,            // Fetch up to 8
        };
        const paginatedData: PaginatedProducts = await getProducts(params); // Corrected function call
        setProducts(paginatedData.results || []);
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Failed to fetch new arrivals:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="overflow-hidden pt-15">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-7 text-center"><p>Loading new arrivals...</p></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden pt-15">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
           <div className="mb-7 text-center">
             <p className="text-red-500">Error loading new arrivals: {error}</p>
           </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <section className="overflow-hidden pt-15">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
           <div className="mb-7 text-center"><p>No new arrivals to display at the moment.</p></div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-06.svg" // Placeholder, update if needed
                alt="icon"
                width={20}
                height={20}
              />
              This Week’s
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar?ordering=-created_at" // Link to shop sorted by newest
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {products.map((item) => (
            <ProductItem item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;