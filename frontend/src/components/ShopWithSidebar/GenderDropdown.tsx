// frontend/src/components/ShopWithSidebar/GenderDropdown.tsx
"use client";
import React, { useState } from "react";

interface BrandItemDisplayProps { // Renamed from GenderItem to BrandItemDisplay
  brandName: string;
  // productCount?: number; // Assuming uniqueBrands is just an array of strings for now
  isSelected: boolean;
  onSelect: () => void;
}

const BrandItemDisplay = ({ brandName, isSelected, onSelect }: BrandItemDisplayProps) => {
  return (
    <button
      className={`${
        isSelected ? "text-blue" : "text-dark-4"
      } group flex items-center justify-between ease-out duration-200 hover:text-blue w-full`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
            isSelected ? "border-blue bg-blue" : "bg-white border-gray-3"
          }`}
        >
          {isSelected && (
            <svg
              className="text-white"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
                stroke="currentColor"
                strokeWidth="1.94437" // camelCase
                strokeLinecap="round" // camelCase
                strokeLinejoin="round" // camelCase
              />
            </svg>
          )}
        </div>
        <span>{brandName}</span>
      </div>
      {/* Add product count if available and needed */}
      {/* <span
        className={`${
          isSelected ? "text-white bg-blue" : "bg-gray-2 text-gray-600"
        } inline-flex rounded-full text-xs px-2 py-0.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue`}
      >
        {productCount}
      </span> */}
    </button>
  );
};

interface BrandDropdownProps { // Renamed from GenderDropdownProps
  availableBrands?: string[]; // Made optional and check for undefined
  onBrandChange: (brand: string | null) => void;
  selectedBrand?: string | null;
  isLoading?: boolean; // Optional: to show loading state
  error?: string | null;   // Optional: to show error state
}

const GenderDropdown = ({ availableBrands, onBrandChange, selectedBrand, isLoading, error }: BrandDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  if (isLoading) {
    return <div className="bg-white shadow-1 rounded-lg p-4 text-sm text-gray-500">Loading brands...</div>;
  }
  if (error) {
     return <div className="bg-white shadow-1 rounded-lg p-4 text-sm text-red-500">Error loading brands.</div>;
  }
  // Guard against availableBrands being undefined or null BEFORE trying to access .length or .map
  if (!availableBrands || availableBrands.length === 0) {
    return (
      <div className="bg-white shadow-1 rounded-lg p-4 text-sm text-gray-500">
        No brands available for filtering.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown ? "shadow-filter" : "" // Ensure shadow-filter is a defined Tailwind class
        }`}
      >
        <p className="text-dark font-semibold">Brand</p> {/* Updated title */}
        <button
          aria-label="button for brand dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown ? "rotate-180" : ""
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd" // camelCase
              clipRule="evenodd" // camelCase
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill="currentColor" // Or a specific color
            />
          </svg>
        </button>
      </div>

      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        <BrandItemDisplay
          brandName="All Brands"
          isSelected={!selectedBrand}
          onSelect={() => onBrandChange(null)}
        />
        {availableBrands.map((brandName, key) => ( // Iterating over availableBrands
          <BrandItemDisplay
            key={key}
            brandName={brandName}
            isSelected={selectedBrand === brandName}
            onSelect={() => onBrandChange(brandName)}
          />
        ))}
      </div>
    </div>
  );
};

export default GenderDropdown; // Consider renaming file and component to BrandDropdown