// frontend/src/components/ShopWithSidebar/PriceDropdown.tsx
"use client";
import { useState, useEffect } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

// Define the props for the component
interface PriceDropdownProps {
  onPriceChange: (min: number, max: number) => void;
  // Optional: Add initialMin and initialMax if you want to set them from parent
  initialMin?: number;
  initialMax?: number;
}

const PriceDropdown = ({ onPriceChange, initialMin = 0, initialMax = 1000 }: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true); // Keep it open by default or manage as needed
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMin, initialMax]);
  const [minPriceInput, setMinPriceInput] = useState<string>(initialMin.toString());
  const [maxPriceInput, setMaxPriceInput] = useState<string>(initialMax.toString());

  // Debounce timeout
  const DEBOUNCE_DELAY = 500; // 500ms

  // Update local state when props change (e.g., if URL params reset the filter)
  useEffect(() => {
    setPriceRange([initialMin, initialMax]);
    setMinPriceInput(initialMin.toString());
    setMaxPriceInput(initialMax.toString());
  }, [initialMin, initialMax]);

  // Effect to call onPriceChange when priceRange is updated by the slider, with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      // Check if the values have actually changed to avoid unnecessary calls
      if (priceRange[0] !== initialMin || priceRange[1] !== initialMax) {
         onPriceChange(priceRange[0], priceRange[1]);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [priceRange, onPriceChange, initialMin, initialMax]);


  const handleSliderChange = (newRange: [number, number]) => {
    const [min, max] = newRange;
    // Ensure min is not greater than max, and max is not less than min
    const validMin = Math.min(min, max);
    const validMax = Math.max(min, max);

    setPriceRange([validMin, validMax]);
    setMinPriceInput(validMin.toString());
    setMaxPriceInput(validMax.toString());
    // The useEffect for priceRange will handle calling onPriceChange
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPriceInput(value);
    const newMin = parseInt(value, 10);
    if (!isNaN(newMin) && newMin <= priceRange[1]) {
      setPriceRange([newMin, priceRange[1]]);
    } else if (value === "") {
      setPriceRange([0, priceRange[1]]); // Or some default min
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPriceInput(value);
    const newMax = parseInt(value, 10);
    if (!isNaN(newMax) && newMax >= priceRange[0]) {
      setPriceRange([priceRange[0], newMax]);
    } else if (value === "") {
      setPriceRange([priceRange[0], initialMax]); // Or some default max
    }
  };

  // Apply button handler (optional, if you want explicit apply)
  const handleApplyFilter = () => {
    const min = parseInt(minPriceInput, 10);
    const max = parseInt(maxPriceInput, 10);

    if (!isNaN(min) && !isNaN(max) && min <= max) {
      onPriceChange(min, max);
    } else {
      // Handle invalid input, e.g., show a message or reset to slider values
      console.warn("Invalid price input. Min:", minPriceInput, "Max:", maxPriceInput);
      // Optionally reset inputs to current slider range if they are invalid
      setMinPriceInput(priceRange[0].toString());
      setMaxPriceInput(priceRange[1].toString());
      onPriceChange(priceRange[0], priceRange[1]);
    }
  };


  return (
    <div className="rounded-lg bg-white p-6 shadow-1">
      <button
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="flex w-full items-center justify-between text-lg font-semibold text-dark"
      >
        Price Range
        <svg
          className={`fill-current ease-in-out duration-200 ${
            toggleDropdown ? "rotate-180" : ""
          }`}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8.99981 11.8577C8.81231 11.8577 8.62481 11.7852 8.47481 11.6352L3.89981 7.06018C3.62481 6.78518 3.62481 6.33018 3.89981 6.05518C4.17481 5.78018 4.62981 5.78018 4.90481 6.05518L8.99981 10.1502L13.0948 6.05518C13.3698 5.78018 13.8248 5.78018 14.0998 6.05518C14.3748 6.33018 14.3748 6.78518 14.0998 7.06018L9.52481 11.6352C9.37481 11.7852 9.18731 11.8577 8.99981 11.8577Z" />
        </svg>
      </button>

      {toggleDropdown && (
        <div className="mt-5">
          <RangeSlider
            id="price-range-slider"
            min={0} // Absolute minimum
            max={1000} // Absolute maximum, adjust as needed
            step={10}
            value={priceRange}
            onInput={handleSliderChange} // Use onInput for continuous updates or onChange for on release
            className="h-2.5 w-full"
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="mr-1 text-sm text-dark-4">$</span>
              <input
                type="number"
                value={minPriceInput}
                onChange={handleMinInputChange}
                onBlur={handleApplyFilter} // Apply on blur if not using a button
                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-dark focus:border-blue focus:outline-none"
                min="0"
                max={initialMax} // Set max for input field
              />
            </div>
            <span className="text-dark-4">-</span>
            <div className="flex items-center">
              <span className="mr-1 text-sm text-dark-4">$</span>
              <input
                type="number"
                value={maxPriceInput}
                onChange={handleMaxInputChange}
                onBlur={handleApplyFilter} // Apply on blur
                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-dark focus:border-blue focus:outline-none"
                min={initialMin} // Set min for input field
                max="1000" // Absolute max
              />
            </div>
          </div>
           {/* Optional Apply Button */}
          {/* <button
            onClick={handleApplyFilter}
            className="mt-4 w-full rounded bg-blue py-2 px-4 text-sm text-white hover:bg-blue-dark focus:outline-none"
          >
            Apply Price
          </button> */}
        </div>
      )}
    </div>
  );
};

export default PriceDropdown;
