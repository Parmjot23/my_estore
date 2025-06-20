"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping"; // This component is for "ship to different address", data needs to be captured
import ShippingMethod from "./ShippingMethod";
import Coupon from "./Coupon";
import Billing from "./Billing"; // Main billing/shipping details here
import { useAppSelector } from "@/redux/store"; // To get cart items
import { selectTotalPrice, CartItem } from "@/redux/features/cart-slice"; // To get cart items and total
import { createOrderFromCart, CreateOrderFromCartPayload } from "@/lib/apiService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";


const Checkout = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);
  const router = useRouter();
  const dispatch = useDispatch();

  // You'll need to manage form state for billing, shipping (if different), etc.
  // For simplicity, I'm showing a direct call, but you'd collect data from form fields.
  const [billingDetails, setBillingDetails] = useState({
    firstName: "", lastName: "", companyName: "", countryRegion: "Australia", // Default or from select
    streetAddress1: "", streetAddress2: "", townCity: "", stateCounty: "", // Added stateCounty
    phone: "", emailAddress: "", createAccount: false, orderNotes: "",
  });
  const [shippingDetails, setShippingDetails] = useState({ /* ... similar to billing ... */ });
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? e.target.checked : undefined;
    setBillingDetails(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Add handleShippingChange if shipToDifferentAddress is true

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setIsLoading(true);

    const orderData: CreateOrderFromCartPayload = {
      first_name: billingDetails.firstName,
      last_name: billingDetails.lastName,
      email: billingDetails.emailAddress,
      address: billingDetails.streetAddress1, // Consolidate address fields as per backend model
      // street_address: billingDetails.streetAddress1, // if separate on backend
      apartment_address: billingDetails.streetAddress2,
      postal_code: "12345", // Get from form
      city: billingDetails.townCity,
      country: billingDetails.countryRegion,
      // Add phone, other fields as per your Order model
      // braintree_nonce: "fake-valid-nonce", // If using payment gateway
    };

    // If shipping to different address, override relevant fields
    // if (shipToDifferentAddress) { /* ... update orderData with shippingDetails ... */ }

    try {
      const createdOrder = await createOrderFromCart(orderData);
      toast.success(`Order #${createdOrder.id} placed successfully!`);
      dispatch(removeAllItemsFromCart()); // Clear the cart
      // Redirect to an order confirmation page
      router.push(`/order-confirmation?orderId=${createdOrder.id}`); // Example
    } catch (err: any) {
      console.error("Failed to create order:", err);
      toast.error(err.data?.detail || err.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName={"Checkout"} /> {/* Updated Breadcrumb call */}
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Pass handleChange and billingDetails to Billing component */}
          {/* <Billing billingDetails={billingDetails} handleChange={handleBillingChange} /> */}
          {/* Similarly for Shipping component */}

          <form onSubmit={handleSubmitOrder}> {/* Add onSubmit to the form */}
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* */}
              <div className="lg:max-w-[670px] w-full">
                <Login />
                {/* Update Billing and Shipping to be controlled components */}
                <Billing
                    // billingDetails={billingDetails}
                    // handleChange={handleBillingChange}
                    // setBillingDetails={setBillingDetails} // If Billing manages its own state internally
                />
                <Shipping
                    // shippingDetails={shippingDetails}
                    // handleShippingChange={handleShippingChange}
                    // setShipToDifferentAddress={setShipToDifferentAddress}
                    // shipToDifferentAddress={shipToDifferentAddress}
                />
                 <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="orderNotes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      name="orderNotes"
                      id="orderNotes"
                      rows={5}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      value={billingDetails.orderNotes}
                      onChange={handleBillingChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>
                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div><h4 className="font-medium text-dark">Product</h4></div>
                      <div><h4 className="font-medium text-dark text-right">Subtotal</h4></div>
                    </div>
                    {cartItems.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div><p className="text-dark">{item.name} x {item.quantity}</p></div>
                        <div><p className="text-dark text-right">${(item.effectivePrice * item.quantity).toFixed(2)}</p></div>
                      </div>
                    ))}
                    {/* Shipping Fee - This might be dynamic based on ShippingMethod */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div><p className="text-dark">Shipping Fee</p></div>
                      <div><p className="text-dark text-right">$15.00</p></div> {/* Placeholder */}
                    </div>
                    <div className="flex items-center justify-between pt-5">
                      <div><p className="font-medium text-lg text-dark">Total</p></div>
                      <div><p className="font-medium text-lg text-dark text-right">${(totalPrice + 15.00).toFixed(2)}</p></div> {/* Placeholder for shipping */}
                    </div>
                  </div>
                </div>
                <Coupon />
                <ShippingMethod />
                <button
                  type="submit"
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-70"
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;