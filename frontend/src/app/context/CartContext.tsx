import React, { createContext, useContext, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import {
  setCartItems,
  CartItem,
} from "@/redux/features/cart-slice";
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from "@/lib/apiService";

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cartReducer.items);

  const fetchCart = async () => {
    try {
      const apiItems = await apiGetCart();
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
      console.error("Failed to fetch cart", err);
    }
  };

  const addItem = async (productId: number, quantity: number) => {
    await apiAddToCart(productId, quantity);
    await fetchCart();
  };

  const updateItem = async (productId: number, quantity: number) => {
    await apiUpdateCartItem(productId, quantity);
    await fetchCart();
  };

  const removeItem = async (productId: number) => {
    await apiRemoveFromCart(productId);
    await fetchCart();
  };

  const clear = async () => {
    await apiClearCart();
    await fetchCart();
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.discountedPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, cartCount, totalPrice, fetchCart, addItem, updateItem, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
};

