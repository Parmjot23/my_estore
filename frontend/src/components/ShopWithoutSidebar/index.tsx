"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types/product";
import { LayoutGrid, List, PanelLeft } from "lucide-react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { getProducts, GetProductsParams, PaginatedResponse } from "@/lib/apiService";

const SearchParamsReader: React.FC<{ onParamsRead: (params: { searchQuery?: string | null; categorySlug?: string | null; brandSlug?: string | null; phoneModelSlug?: string | null; }) => void; }> = ({ onParamsRead }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const categorySlug = searchParams.get("category__slug");
    const brandSlug = searchParams.get("brand__slug");
    const phoneModelSlug = searchParams.get("compatible_with__slug");
    const searchQuery = searchParams.get("search");
    onParamsRead({ searchQuery, categorySlug, brandSlug, phoneModelSlug });
  }, [searchParams, onParamsRead]);
  return null;
};

const ShopWithoutSidebarContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  // Responsive grid; page size tuned for larger screens
  const gridSize = 3;
  const itemsPerPage = 12;

  const [filters, setFilters] = useState<Omit<GetProductsParams, "page" | "page_size">>({
    ordering: "-created_at",
    category__slug: undefined,
    brand__slug: undefined,
    compatible_with__slug: undefined,
    search: undefined,
  });
  const [initialUrlFiltersApplied, setInitialUrlFiltersApplied] = useState(false);

  const handleInitialUrlParams = useCallback((params: { searchQuery?: string | null; categorySlug?: string | null; brandSlug?: string | null; phoneModelSlug?: string | null; }) => {
    setFilters(prev => ({
      ...prev,
      search: params.searchQuery || undefined,
      category__slug: params.categorySlug || undefined,
      brand__slug: params.brandSlug || undefined,
      compatible_with__slug: params.phoneModelSlug || undefined,
    }));
    setCurrentPage(1);
    setInitialUrlFiltersApplied(true);
  }, []);

  const fetchShopProducts = useCallback(async (currentFilterCriteria: Omit<GetProductsParams, "page" | "page_size">) => {
    setIsLoading(true);
    setError(null);
    const finalApiParams: GetProductsParams = {
      ...currentFilterCriteria,
      page: currentPage,
      page_size: itemsPerPage,
    };
    try {
      const paginatedResponse: PaginatedResponse<Product> = await getProducts(finalApiParams);
      if (paginatedResponse && Array.isArray(paginatedResponse.results)) {
        setProducts(paginatedResponse.results);
        setTotalProducts(paginatedResponse.count);
        const pageSize = finalApiParams.page_size || itemsPerPage;
        setTotalPages(Math.ceil(paginatedResponse.count / pageSize));
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
        setError("Unexpected data structure for products.");
      }
    } catch (err: any) {
      setError(err.data?.detail || err.message || "Failed to fetch products.");
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (initialUrlFiltersApplied) {
      fetchShopProducts(filters);
    }
  }, [filters, currentPage, fetchShopProducts, initialUrlFiltersApplied]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, ordering: e.target.value }));
    setCurrentPage(1);
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  // Responsive grid columns: 1 on xs, 2 on sm, 3 on md, 4 on lg+
  const gridColsClass = "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [] as number[];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    if (startPage > 1) { pageNumbers.push(1); if (startPage > 2) pageNumbers.push(-1); }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    if (endPage < totalPages) { if (endPage < totalPages - 1) pageNumbers.push(-1); pageNumbers.push(totalPages); }
    return (
      <nav aria-label="Page navigation" className="flex justify-center mt-12">
        <ul className="inline-flex items-center space-x-px">
          <li>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Previous</button>
          </li>
          {pageNumbers.map((number, index) => number === -1 ? (
            <li key={`ellipsis-${index}`}><span className="px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>
          ) : (
            <li key={number}><button onClick={() => handlePageChange(number)} className={`px-3 h-8 leading-tight border ${currentPage === number ? "text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700 z-10" : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"}`}>{number}</button></li>
          ))}
          <li>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Next</button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      <SearchParamsReader onParamsRead={handleInitialUrlParams} />
      <Breadcrumb pageName="Shop" />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 p-4 bg-white rounded-lg shadow flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing {products.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} results
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/shop-with-sidebar" className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300" aria-label="Go to shop with sidebar">
                <PanelLeft size={20} />
              </Link>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm text-gray-700 shrink-0">Sort by:</label>
                <select id="sort" name="sort" value={filters.ordering} onChange={handleSortChange} className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 shadow-sm">
                  <option value="-created_at">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-label="Grid view"><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-md ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-label="List view"><List size={20} /></button>
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>
          )}
          {error && <p className="text-red-500 text-center py-10">{error}</p>}
          {!isLoading && !error && products.length === 0 && (
            <p className="text-gray-600 text-center py-10">No products found matching your criteria. (API returned {totalProducts} total for query)</p>
          )}
          {!isLoading && !error && products.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <div className={`grid grid-cols-1 gap-6 ${gridColsClass}`}>
                  {products.map((product, index) => (
                    !product || typeof product.id === "undefined" ? (
                      <div key={`invalid-grid-${index}`} className="text-red-500 p-2 border border-red-300">Invalid product data</div>
                    ) : (
                      <SingleGridItem key={product.id || `grid-fallback-${index}`} product={product} />
                    )
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((product, index) => (
                    !product || typeof product.id === "undefined" ? (
                      <div key={`invalid-list-${index}`} className="text-red-500 p-2 border border-red-300">Invalid product data</div>
                    ) : (
                      <SingleListItem key={product.id || `list-fallback-${index}`} item={product} />
                    )
                  ))}
                </div>
              )}
              {renderPagination()}
            </>
          )}
        </div>
      </section>
    </>
  );
};

const ShopWithoutSidebar: React.FC = () => (
  <Suspense fallback={<div>Loading shop...</div>}>
    <ShopWithoutSidebarContent />
  </Suspense>
);

export default ShopWithoutSidebar;
