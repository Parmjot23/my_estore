// src/redux/features/auth-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthTokens } from "@/types/user"; // Ensure this path is correct

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true, // Start with loading true to check for existing tokens
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (
      state,
      action: PayloadAction<{
        user: User | null;
        tokens: AuthTokens | null;
      }>
    ) => {
      const { user, tokens } = action.payload;
      if (user && tokens) {
        state.isAuthenticated = true;
        state.user = user;
        state.accessToken = tokens.access;
        state.refreshToken = tokens.refresh;
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", tokens.access);
          localStorage.setItem("refresh_token", tokens.refresh || "");
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
      }
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        // Potentially call an API endpoint to blacklist the refresh token on the backend
      }
    },
    loadUserFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        const userString = localStorage.getItem("user");

        if (accessToken && userString) {
          try {
            const user = JSON.parse(userString);
            state.isAuthenticated = true;
            state.user = user;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
          } catch (e) {
            // If parsing fails, clear storage
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
          }
        }
      }
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUserInState: (state, action: PayloadAction<User>) => {
      if (state.isAuthenticated && state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    }
  },
});

export const {
  setAuthState,
  logout,
  loadUserFromStorage,
  setLoading,
  setError,
  updateUserInState,
} = authSlice.actions;

export default authSlice.reducer;
