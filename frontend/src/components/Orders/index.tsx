// src/components/Orders/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder"; // Assuming SingleOrder is adapted for new Order type
// Remove import ordersData from "./ordersData"; // No longer using static data
import { getUserOrders } from "@/lib/apiService";
import { Order as OrderType } from "@/types/product"; // Using Order type from product.ts
import { toast } from "react-toastify";
import { ShoppingBag } from "lucide-react"; // Icon for empty state

const Orders = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userOrders = await getUserOrders();
        setOrders(userOrders || []); // Ensure it's an array
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setError(err.data?.detail || err.message || "Could not load your orders.");
        toast.error(err.data?.detail || err.message || "Failed to load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue mx-auto my-4"></div>
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 md:p-10 text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px] md:min-w-[770px]"> {/* Adjusted min-width for better responsiveness */}
          {orders.length > 0 ? (
            <>
              {/* Table Header for larger screens */}
              <div className="items-center justify-between py-4 px-5 sm:px-7.5 hidden md:flex bg-gray-50 dark:bg-dark-2/30 rounded-t-lg border-b border-gray-200 dark:border-dark-3">
                <div className="min-w-[100px] xl:min-w-[111px]">
                  <p className="text-custom-sm font-semibold text-dark dark:text-gray-300">Order ID</p>
                </div>
                <div className="min-w-[150px] xl:min-w-[175px]">
                  <p className="text-custom-sm font-semibold text-dark dark:text-gray-300">Date</p>
                </div>
                <div className="min-w-[110px] xl:min-w-[128px]">
                  <p className="text-custom-sm font-semibold text-dark dark:text-gray-300">Status</p>
                </div>
                <div className="min-w-[150px] flex-grow xl:min-w-[213px]">
                  <p className="text-custom-sm font-semibold text-dark dark:text-gray-300">Total</p>
                </div>
                <div className="min-w-[100px] xl:min-w-[113px] text-right">
                  <p className="text-custom-sm font-semibold text-dark dark:text-gray-300">Actions</p>
                </div>
              </div>
              {/* Order Items */}
              {orders.map((orderItem) => (
                <SingleOrder key={orderItem.id} orderItem={orderItem} />
              ))}
            </>
          ) : (
            <div className="py-10 px-4 sm:px-7.5 xl:px-10 text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;