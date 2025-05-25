// frontend/src/components/Header/CustomSelect.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Category as CategoryType } from "@/types/category"; // Adjust path if needed

interface CustomSelectProps {
  categories: CategoryType[];
  selectedCategorySlug: string | null; // Slug of the selected category, or null for "All"
  onCategoryChange: (categorySlug: string | null) => void;
  // Retain original styling class names if they are important
  // We will use Tailwind for consistency with the Header, but you can adapt
}

const CustomSelect = ({ categories, selectedCategorySlug, onCategoryChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getDisplayLabel = (): string => {
    if (selectedCategorySlug === null || selectedCategorySlug === "") {
      return "All Categories";
    }
    const foundCategory = categories.find(cat => cat.slug === selectedCategorySlug);
    return foundCategory ? foundCategory.name : "All Categories";
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (categorySlug: string | null) => {
    onCategoryChange(categorySlug);
    setIsOpen(false); // Close dropdown after selection
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) { // Only close if it was open
            setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Re-run if isOpen changes

  return (
    // Using Tailwind classes similar to the Header's search bar for consistency
    // The original inline style width: "200px" can be replaced by Tailwind or kept if specific
    <div className="relative" ref={dropdownRef}> {/* Removed custom-select and dropdown-content for now, can be added back if needed */}
      <button
        type="button"
        onClick={toggleDropdown}
        // Classes from the provided Header/index.tsx for the select part of search
        className={`flex items-center justify-between gap-2.5 rounded-l-md border border-r-0 border-black bg-white px-5 py-[11px] text-sm text-dark-4 focus:outline-none min-w-[170px] text-left duration-200 hover:border-blue focus:border-blue ${
          isOpen ? "select-arrow-active" : "" // Original class for arrow state
        }`}
      >
        <span className="whitespace-nowrap">{getDisplayLabel()}</span>
        <svg
          className={`fill-current duration-200 ease-in-out ${isOpen ? "rotate-180" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.99992 10.5332C7.83325 10.5332 7.66659 10.4665 7.53325 10.3332L3.53325 6.33317C3.26659 6.0665 3.26659 5.63317 3.53325 5.3665C3.79992 5.09984 4.23325 5.09984 4.49992 5.3665L7.99992 8.8665L11.4999 5.3665C11.7666 5.09984 12.1999 5.09984 12.4666 5.3665C12.7333 5.63317 12.7333 6.0665 12.4666 6.33317L8.46659 10.3332C8.33325 10.4665 8.16659 10.5332 7.99992 10.5332Z" />
        </svg>
      </button>
      <div
        // Classes for the dropdown items panel
        className={`select-items absolute left-0 top-full z-50 mt-1 w-full min-w-[170px] rounded-[5px] border border-gray-3 bg-white py-2 shadow-md ${
          isOpen ? "" : "select-hide hidden" // Original class select-hide + Tailwind hidden
        }`}
      >
        <button
          onClick={() => handleOptionClick(null)}
          className={`select-item block w-full px-5 py-2 text-left text-sm text-dark hover:bg-gray-1 hover:text-blue ${
            selectedCategorySlug === null ? "same-as-selected bg-gray-100 font-semibold" : "" // Style for selected
          }`}
        >
          All Categories
        </button>
        {categories && categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleOptionClick(category.slug)}
            className={`select-item block w-full px-5 py-2 text-left text-sm text-dark hover:bg-gray-1 hover:text-blue ${
              selectedCategorySlug === category.slug ? "same-as-selected bg-gray-100 font-semibold" : "" // Style for selected
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
