"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setCartItems } from "@/redux/features/cart-slice";
import { getCart } from "@/lib/apiService";

const CartInitializer = () => {
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const apiItems = await getCart();
        const mapped = apiItems.map((item) => ({
          id: item.product_details.id,
          title: item.product_details.name,
          price: Number(item.product_details.price),
          discountedPrice: item.product_details.discounted_price
            ? Number(item.product_details.discounted_price)
            : Number(item.product_details.price),
          quantity: item.quantity,
          imgs: item.product_details.imgs,
        }));
        dispatch(setCartItems(mapped));
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };

    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, dispatch]);

  return null;
};

export default CartInitializer;
