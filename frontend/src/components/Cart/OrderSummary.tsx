import { selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getUserAddresses, createOrderFromCart } from "@/lib/apiService";
import { Address } from "@/types/user";

const OrderSummary = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const user = useAppSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getUserAddresses();
        setAddresses(data || []);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const handleCreateOrder = async () => {
    if (!user) {
      toast.info("Please sign in to checkout.");
      router.push("/signin");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const address =
      addresses.find((a) => a.is_default && a.address_type === "SHIPPING") ||
      addresses.find((a) => a.address_type === "SHIPPING") ||
      addresses[0];

    if (!address) {
      toast.error("Please add a shipping address in your account.");
      return;
    }

    const orderData = {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email,
      street_address: address.street_address,
      apartment_address: address.apartment_address || "",
      postal_code: address.postal_code,
      city: address.city,
      country: address.country,
    };

    setIsLoading(true);
    try {
      const created = await createOrderFromCart(orderData);
      toast.success(`Order #${created.id} placed successfully!`);
      dispatch(removeAllItemsFromCart());
      router.push("/orders");
    } catch (err: any) {
      console.error("Failed to create order:", err);
      toast.error(err.data?.detail || err.message || "Failed to create order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartItems.map((item, key) => (
            <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
              <div>
                <p className="text-dark">{item.title}</p>
              </div>
              <div>
                <p className="text-dark text-right">
                  ${(item.discountedPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={isLoading}
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-70"
          >
            {isLoading ? "Processing..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
