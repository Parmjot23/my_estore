// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
// Import useDispatch and alias it to avoid potential naming conflicts locally if necessary,
// and to make the typed export more direct.
import { TypedUseSelectorHook, useSelector, useDispatch as useReduxDispatch } from "react-redux";

import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";
import authReducer from "./features/auth-slice"; // Import the auth reducer

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
    authReducer, // Add the auth reducer here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Updated export style for useAppDispatch
// This directly exports the correctly typed hook.
export const useAppDispatch: () => AppDispatch = useReduxDispatch;
