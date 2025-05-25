// src/components/Orders/OrderDetails.tsx
import React from "react";
import { Order as OrderType, OrderItem } from "@/types/product"; // Use the backend Order type
import Image from "next/image"; // For product images
import Link from "next/link"; // For linking to products

interface OrderDetailsProps {
  orderItem: OrderType; // Renamed prop to 'order' for clarity
}

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/60x60/F0F0F0/777777?text=N/A";


const OrderDetails = ({ orderItem: order }: OrderDetailsProps) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "text-green bg-green-light-6 dark:bg-green-700/20 dark:text-green-300";
      case "pending": return "text-yellow bg-yellow-light-4 dark:bg-yellow-600/20 dark:text-yellow-300";
      case "processing": return "text-blue bg-blue-light-5 dark:bg-blue-700/20 dark:text-blue-300";
      case "shipped": return "text-indigo-600 bg-indigo-100 dark:bg-indigo-700/20 dark:text-indigo-300";
      case "cancelled": return "text-red bg-red-light-6 dark:bg-red-700/20 dark:text-red-400";
      case "refunded": return "text-gray-600 bg-gray-200 dark:bg-gray-700/30 dark:text-gray-400";
      default: return "text-gray-700 bg-gray-100 dark:bg-dark-3 dark:text-gray-300";
    }
  };


  return (
    <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-semibold text-dark dark:text-white mb-6">Order Details</h3>

      {/* Order Summary Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Order ID:</p>
          <p className="font-medium text-dark dark:text-white">#{order.id}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Date Placed:</p>
          <p className="font-medium text-dark dark:text-white">{formatDate(order.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Total Amount:</p>
          <p className="font-medium text-dark dark:text-white">${Number(order.total_cost).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Status:</p>
          <span className={`inline-block text-xs py-1 px-2.5 rounded-full capitalize font-semibold ${getStatusClass(order.status)}`}>
            {order.status.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Items in this Order */}
      <div className="mb-6">
        <h4 className="font-semibold text-md text-dark dark:text-white mb-3">Items Ordered ({order.items.length})</h4>
        <div className="space-y-4">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-start gap-4 p-3 border border-gray-200 dark:border-dark-3 rounded-lg bg-gray-50 dark:bg-dark-input">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-dark-2 rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src={item.product_details?.cover_image_url || item.product_details?.imgs?.thumbnails?.[0] || PLACEHOLDER_IMAGE_URL}
                  alt={item.product_details?.name || "Product Image"}
                  width={60}
                  height={60}
                  unoptimized
                  className="object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;}}
                />
              </div>
              <div className="flex-grow min-w-0">
                <Link href={`/shop-details/${item.product_details?.slug || item.product_id}`} className="text-sm font-medium text-dark dark:text-white hover:text-blue dark:hover:text-blue transition-colors truncate block">
                  {item.product_details?.name || `Product ID: ${item.product_id}`}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price: ${Number(item.price).toFixed(2)}</p>
              </div>
              <div className="text-sm font-medium text-dark dark:text-white text-right">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Billing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-md text-dark dark:text-white mb-3">Shipping Address</h4>
          <address className="text-sm text-gray-600 dark:text-gray-400 not-italic space-y-0.5">
            <p>{order.first_name} {order.last_name}</p>
            <p>{order.street_address}</p>
            {order.apartment_address && <p>{order.apartment_address}</p>}
            <p>{order.city}, {order.postal_code}</p> {/* Assuming state/province might be part of city or not always present */}
            <p>{order.country}</p>
            <p>Email: {order.email}</p>
            {/* Add phone if available in order details */}
          </address>
        </div>
        {/* Add Billing Address section if it can be different from shipping */}
      </div>
    </div>
  );
};

export default OrderDetails;