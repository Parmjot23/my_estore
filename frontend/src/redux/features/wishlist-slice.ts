// src/redux/features/wishlist-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product"; // Import the main Product type

// The items in our wishlist state will be Product objects.
export type WishlistItem = Product;

interface InitialState { // Changed from type to interface for consistency
  items: WishlistItem[];
}

const initialState: InitialState = {
  items: [],
};

export const wishlistSlice = createSlice({ // Renamed from wishlist to wishlistSlice for clarity
  name: "wishlist",
  initialState,
  reducers: {
    // Action to add a product to the wishlist
    addItemToWishlist: (state, action: PayloadAction<Product>) => {
      const productToAdd = action.payload;
      // Check if the product already exists in the wishlist by its ID
      const existingItem = state.items.find((item) => item.id === productToAdd.id);

      if (!existingItem) {
        // If it doesn't exist, add it.
        // We store the entire product object, or a defined subset if preferred.
        state.items.push(productToAdd);
      }
      // If it already exists, you might choose to do nothing or update it (e.g., if quantity was relevant)
      // For a typical wishlist, simply not adding duplicates is common.
    },
    // Action to remove a product from the wishlist by its ID
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const productIdToRemove = action.payload;
      state.items = state.items.filter((item) => item.id !== productIdToRemove);
    },
    // Action to clear all items from the wishlist
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
    // Action to set the entire wishlist, e.g., after fetching from API
    setWishlistItems: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    }
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  setWishlistItems, // Export the new action
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
