// src/components/Orders/SingleOrder.tsx
import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import { Order as OrderType } from "@/types/product"; // Use the backend Order type

interface SingleOrderProps {
  orderItem: OrderType;
  // smallView prop is removed as responsive design will handle layout
}

const SingleOrder = ({ orderItem }: SingleOrderProps) => {
  const [showDetails, setShowDetails] = useState(false);
  // const [showEdit, setShowEdit] = useState(false); // Editing orders might be an admin feature

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // const toggleEdit = () => {
  //   setShowEdit(!showEdit);
  // };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    // setShowEdit(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'long', day: 'numeric'
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
    <>
      {/* Desktop and Tablet View (visible on md and up) */}
      <div className="items-center justify-between border-t border-gray-200 dark:border-dark-3 py-5 px-5 sm:px-7.5 hidden md:flex hover:bg-gray-50 dark:hover:bg-dark-2/40 transition-colors duration-150">
        <div className="min-w-[100px] xl:min-w-[111px]">
          <p className="text-custom-sm text-blue hover:underline cursor-pointer" onClick={toggleDetails}>
            #{orderItem.id}
          </p>
        </div>
        <div className="min-w-[150px] xl:min-w-[175px]">
          <p className="text-custom-sm text-dark dark:text-gray-300">{formatDate(orderItem.created_at)}</p>
        </div>
        <div className="min-w-[110px] xl:min-w-[128px]">
          <span
            className={`inline-block text-custom-sm py-1 px-3 rounded-full capitalize font-medium ${getStatusClass(orderItem.status)}`}
          >
            {orderItem.status.toLowerCase()}
          </span>
        </div>
        <div className="min-w-[150px] flex-grow xl:min-w-[213px]">
          <p className="text-custom-sm text-dark dark:text-gray-300 font-semibold">
            ${Number(orderItem.total_cost).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{orderItem.items.length} item(s)</p>
        </div>
        <div className="min-w-[100px] xl:min-w-[113px] flex justify-end">
          <OrderActions
            orderId={orderItem.id} // Pass orderId for actions if needed
            toggleDetails={toggleDetails}
            // toggleEdit={toggleEdit} // Edit might be admin-only
          />
        </div>
      </div>

      {/* Mobile View (visible below md) */}
      <div className="block md:hidden border-t border-gray-200 dark:border-dark-3 py-4 px-4 hover:bg-gray-50 dark:hover:bg-dark-2/40 transition-colors duration-150">
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-custom-sm text-blue hover:underline cursor-pointer font-semibold" onClick={toggleDetails}>
                    Order #{orderItem.id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(orderItem.created_at)}
                </p>
            </div>
            <span
            className={`inline-block text-xs py-1 px-2.5 rounded-full capitalize font-medium ${getStatusClass(orderItem.status)}`}
          >
            {orderItem.status.toLowerCase()}
          </span>
        </div>
        <div className="text-sm text-dark dark:text-gray-300 mb-1">
            Total: <span className="font-semibold">${Number(orderItem.total_cost).toFixed(2)}</span> ({orderItem.items.length} item(s))
        </div>
        <div className="mt-2 flex justify-end">
            <OrderActions
                orderId={orderItem.id}
                toggleDetails={toggleDetails}
                // toggleEdit={toggleEdit}
            />
        </div>
      </div>

      {/* Modal for Details/Edit - ensure OrderModal is adapted for the new OrderType */}
      {showDetails && (
        <OrderModal
          showDetails={showDetails}
          // showEdit={showEdit}
          toggleModal={toggleModal}
          order={orderItem} // Pass the full orderItem object
        />
      )}
    </>
  );
};

export default SingleOrder;