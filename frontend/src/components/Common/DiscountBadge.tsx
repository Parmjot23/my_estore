import React from 'react';

interface DiscountBadgeProps {
  percentage: number;
  className?: string;
}

const DiscountBadge: React.FC<DiscountBadgeProps> = ({ percentage, className = '' }) => {
  if (!percentage || percentage <= 0) return null;
  return (
    <span className={`inline-flex items-center font-semibold text-xs text-white bg-red rounded-full px-2 py-0.5 shadow ${className}`}>
      {percentage}% OFF
    </span>
  );
};

export default DiscountBadge;
