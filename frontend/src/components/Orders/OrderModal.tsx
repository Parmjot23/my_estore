import React, { useRef, useEffect } from "react";
import OrderDetails from "./OrderDetails";
import EditOrder from "./EditOrder";

const OrderModal = ({ showDetails, showEdit, toggleModal, order }: any) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        toggleModal(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [toggleModal]);

  if (!showDetails && !showEdit) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-8 overflow-y-auto">
      <div
        ref={modalRef}
        className="shadow-7 relative w-full max-w-2xl rounded-[15px] bg-white transition-all transform p-4 sm:p-6 md:p-8"
      >
        <button
          onClick={() => toggleModal(false)}
          className="text-body absolute -right-4 -top-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full border-2 border-stroke bg-white hover:text-dark"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.9983 10.586L17.9483 5.63603L19.3623 7.05003L14.4123 12L19.3623 16.95L17.9483 18.364L12.9983 13.414L8.04828 18.364L6.63428 16.95L11.5843 12L6.63428 7.05003L8.04828 5.63603L12.9983 10.586Z"
              fill="currentColor"
            ></path>
          </svg>
        </button>

        {showDetails && <OrderDetails orderItem={order} />}
        {showEdit && <EditOrder order={order} toggleModal={toggleModal} />}
      </div>
    </div>
  );
};

export default OrderModal;
