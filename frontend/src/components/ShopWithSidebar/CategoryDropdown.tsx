// frontend/src/components/ShopWithSidebar/CategoryDropdown.tsx
"use client";
import React, { useState } from "react";
import { Category as CategoryType } from '@/types/product'; // Using richer Category type
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
  allCategories: CategoryType[];
  isLoading: boolean;
  error: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  selectedCategory?: string | null;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  allCategories,
  isLoading,
  error,
  onCategoryChange,
  selectedCategory,
}) => {
  const [isOpen, setIsOpen] = useState(true); // Keep open by default or manage

  if (isLoading) {
    return <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm text-sm text-gray-500">Loading categories...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm text-sm text-red-500">Error: {error}</div>;
  }

  // Guard against allCategories being undefined, null, or empty before mapping
  if (!allCategories || allCategories.length === 0) {
    return <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm text-sm text-gray-500">No categories found.</div>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <ul className="mt-4 space-y-2">
          <li>
            <button
              onClick={() => onCategoryChange(null)} // Pass null for "All Categories"
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 ${
                !selectedCategory ? "font-semibold text-indigo-600 bg-indigo-50" : "text-gray-600"
              }`}
            >
              All Categories
            </button>
          </li>
          {allCategories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryChange(category.slug)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 flex justify-between items-center ${
                  selectedCategory === category.slug ? "font-semibold text-indigo-600 bg-indigo-50" : "text-gray-600"
                }`}
              >
                <span>{category.name}</span>
                {/* Display product_count, defaulting to 0 if undefined */}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === category.slug ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    ({category.product_count || 0})
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown;