// frontend/src/components/ShopWithSidebar/index.tsx
"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // For SearchParamsReader
import { Product, Category as CategoryType } from "@/types/product";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown from "./PriceDropdown";
import GenderDropdown from "./GenderDropdown"; // Assuming this is for Brands
import { getProducts, GetProductsParams, PaginatedResponse, getCategories } from "@/lib/apiService";
import { LayoutGrid, List } from "lucide-react";
import Breadcrumb from "../Common/Breadcrumb";

// Helper component to read search params
const SearchParamsReader: React.FC<{
    onParamsRead: (params: { categorySlug?: string | null, brandSlug?: string | null, searchQuery?: string | null }) => void;
}> = ({ onParamsRead }) => {
    const searchParams = useSearchParams();
    useEffect(() => {
        const categorySlug = searchParams.get("category__slug");
        const brandSlug = searchParams.get("brand__slug"); // If you use this
        const searchQuery = searchParams.get("search");   // If you use this
        onParamsRead({ categorySlug, brandSlug, searchQuery });
    }, [searchParams, onParamsRead]); // Re-run if searchParams object instance changes (important for Next.js)
    return null;
};

const ShopWithSidebarContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Initial isLoading should be true if fetching on mount
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const itemsPerPage = 9;

  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Omit<GetProductsParams, 'page' | 'page_size'>>({
    ordering: "-created_at",
    category__slug: undefined,
    min_price: 0,
    max_price: 50,
    brand__slug: undefined,
    search: undefined,
  });
  // Flag to indicate if the initial filters from URL have been applied
  const [initialUrlFiltersApplied, setInitialUrlFiltersApplied] = useState(false);


  const handleInitialUrlParams = useCallback((params: { categorySlug?: string | null, brandSlug?: string | null, searchQuery?: string | null }) => {
    setFilters(prev => ({
        ...prev, // Keep existing defaults like ordering
        category__slug: params.categorySlug || undefined,
        brand__slug: params.brandSlug || undefined,
        search: params.searchQuery || undefined,
    }));
    setCurrentPage(1); // Reset to page 1 for any new filter set from URL
    setInitialUrlFiltersApplied(true); // Mark that initial URL params have been processed
  }, []);


  const fetchShopProducts = useCallback(async (currentFilterCriteria: Omit<GetProductsParams, 'page' | 'page_size'>) => {
    setIsLoading(true);
    setError(null);
    const finalApiParams: GetProductsParams = {
        ...currentFilterCriteria,
        page: currentPage,
        page_size: itemsPerPage,
    };
    try {
      const paginatedResponse: PaginatedResponse<Product> = await getProducts(finalApiParams);
      // ... (handle response as before)
      if (paginatedResponse && Array.isArray(paginatedResponse.results)) {
        setProducts(paginatedResponse.results);
        setTotalProducts(paginatedResponse.count);
        const pageSize = finalApiParams.page_size || itemsPerPage;
        setTotalPages(Math.ceil(paginatedResponse.count / pageSize));
      } else {
        setProducts([]); setTotalProducts(0); setTotalPages(1);
        setError("Unexpected data structure for products.");
      }
    } catch (err: any) {
      setError(err.data?.detail || err.message || "Failed to fetch products.");
      setProducts([]); setTotalProducts(0); setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true); setCategoryError(null);
      try {
        const fetchedCategories = await getCategories();
        setAllCategories(fetchedCategories || []);
      } catch (err: any) {
        setCategoryError(err.message || "Failed to load categories.");
        setAllCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // This useEffect is responsible for fetching products when filters or currentPage change.
  // It now waits for `initialUrlFiltersApplied` to be true before the first "real" fetch based on filters.
  useEffect(() => {
    if (initialUrlFiltersApplied) { // Only fetch if URL params have been processed
        fetchShopProducts(filters);
    } else {
        // Optionally, you could make an initial fetch here with no category filter
        // if you want to show all products before SearchParamsReader updates the state.
        // However, it's cleaner to wait for SearchParamsReader if URL params are common.
        // For now, if no URL params, filters will be default and this will run once initialUrlFiltersApplied becomes true.
        // If SearchParamsReader sets no category, filters.category__slug will be undefined, fetching all.
    }
  }, [filters, currentPage, fetchShopProducts, initialUrlFiltersApplied]);


  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, ordering: e.target.value }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (categorySlug: string | null) => {
    setFilters(prev => ({ ...prev, category__slug: categorySlug || undefined }));
    setCurrentPage(1);
  };

  const handlePriceChange = (min?: number, max?: number) => {
    setFilters(prev => ({ ...prev, min_price: min, max_price: max }));
    setCurrentPage(1);
  };


  const handleBrandSlugChange = (brandSlug: string | null) => {
    setFilters(prev => ({...prev, brand__slug: brandSlug || undefined }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const uniqueBrandNames = Array.from(new Set(products.map(p => p.brand_details?.name).filter(Boolean))) as string[];

  const renderPagination = () => { /* ... keep your existing pagination logic ... */
    if (totalPages <= 1) return null;
    const pageNumbers = []; const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    if (startPage > 1) { pageNumbers.push(1); if (startPage > 2) pageNumbers.push(-1); }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    if (endPage < totalPages) { if (endPage < totalPages - 1) pageNumbers.push(-1); pageNumbers.push(totalPages); }
    return (
      <nav aria-label="Page navigation" className="flex justify-center mt-12"><ul className="inline-flex items-center -space-x-px">
          <li><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Previous</button></li>
          {pageNumbers.map((number, index) => number === -1 ? (<li key={`ellipsis-${index}`}><span className="px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>) : (<li key={number}><button onClick={() => handlePageChange(number)} className={`px-3 h-8 leading-tight border ${currentPage === number ? "text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700 z-10" : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"}`}>{number}</button></li>))}
          <li><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Next</button></li>
      </ul></nav>
    );
  };

  return (
    <>
      <SearchParamsReader onParamsRead={handleInitialUrlParams} />
      <Breadcrumb pageName={"Shop"} />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <div className="space-y-6">
                <CategoryDropdown allCategories={allCategories} isLoading={isLoadingCategories} error={categoryError} onCategoryChange={handleCategoryChange} selectedCategory={filters.category__slug} />
                <PriceDropdown onPriceChange={handlePriceChange} initialMin={filters.min_price} initialMax={filters.max_price} />
                <GenderDropdown availableBrands={uniqueBrandNames} onBrandChange={handleBrandSlugChange} selectedBrand={filters.brand__slug} isLoading={isLoading} />
              </div>
            </aside>
            <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-white rounded-lg shadow">
                {/* ... (Top bar with sort and view mode) ... */}
                <p className="text-sm text-gray-600 mb-4 sm:mb-0">
                    Showing {products.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-
                    {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} results
                </p>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                    <label htmlFor="sort" className="mr-2 text-sm text-gray-700 shrink-0">Sort by:</label>
                    <select id="sort" name="sort" value={filters.ordering} onChange={handleSortChange} className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 shadow-sm">
                        <option value="-created_at">Newest</option><option value="price">Price: Low to High</option><option value="-price">Price: High to Low</option><option value="name">Name: A to Z</option><option value="-name">Name: Z to A</option>
                    </select>
                    </div>
                    <div className="flex items-center space-x-1">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-label="Grid view"><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-md ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-label="List view"><List size={20} /></button>
                    </div>
                </div>
              </div>
              {/* Product list rendering logic from previous correct version */}
              {isLoading && (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>)}
              {error && <p className="text-red-500 text-center py-10">{error}</p>}
              {!isLoading && !error && products.length === 0 && (<p className="text-gray-600 text-center py-10">No products found matching your criteria. (API returned {totalProducts} total for query)</p>)}
              {!isLoading && !error && products.length > 0 && (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {products.map((product, index) => (!product || typeof product.id === 'undefined' ? <div key={`invalid-grid-${index}`} className="text-red-500 p-2 border border-red-300">Invalid product data</div> : <SingleGridItem key={product.id || `grid-fallback-${index}`} product={product} /> ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {products.map((product, index) => (!product || typeof product.id === 'undefined' ? <div key={`invalid-list-${index}`} className="text-red-500 p-2 border border-red-300">Invalid product data</div> : <SingleListItem key={product.id || `list-fallback-${index}`} item={product} /> ))}
                    </div>
                  )}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ShopWithSidebar: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading shop page...</div>}>
            <ShopWithSidebarContent />
        </Suspense>
    );
};

export default ShopWithSidebar;