// src/lib/apiService.ts
import { Product, PaginatedProducts, Review, Tag, Order, CreateOrderPayload, WishlistItem as ApiWishlistItem, Category as ProductCategoryType } from "@/types/product"; // Used ApiWishlistItem
import { Category } from "@/types/category";
import { User, AuthTokens, LoginCredentials, RegisterData, Address } from "@/types/user";

const API_ROOT = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ApiErrorData {
  detail?: string;
  message?: string;
  [key: string]: any;
}
interface ApiError extends Error {
  status?: number;
  data?: ApiErrorData;
  rawErrorBody?: string;
}


const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    console.log("[getAuthToken] Retrieved token from localStorage:", token); // Log the retrieved token
    // Check if the token is literally the string "undefined" or "null"
    if (token === "undefined" || token === "null") {
        console.warn("[getAuthToken] localStorage contains invalid token string:", token);
        return null;
    }
    return token;
  }
  return null;
};

async function fetchWrapper<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken(); // getAuthToken now has logging
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  console.log(`[fetchWrapper] Requesting: ${options?.method || 'GET'} ${url}`);
  if (options?.body) {
      console.log(`[fetchWrapper] Request Body: ${options.body}`);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("[fetchWrapper] Using token for Authorization header:", token);
  } else {
    console.log("[fetchWrapper] No token found or token is invalid, 'Authorization' header not set.");
  }
  console.log("[fetchWrapper] Request Headers:", headers);


  let response;
  try {
    response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorData: ApiErrorData = { message: `API request failed with status ${response.status}: ${response.statusText}` };
      let rawErrorBody = '';
      try {
        rawErrorBody = await response.text();
        console.log(`[fetchWrapper] Raw Error Response Body (Status ${response.status}):`, rawErrorBody);
        const jsonError = JSON.parse(rawErrorBody);
        errorData = { ...errorData, ...jsonError };
      } catch (e) {
        errorData.message = `API request failed with status ${response.status}. Non-JSON response: ${rawErrorBody.substring(0,100)}...`;
        console.warn(`[fetchWrapper] Could not parse error response as JSON. Status: ${response.status}, Body: ${rawErrorBody}`);
      }

      const error: ApiError = new Error(errorData.detail || errorData.message || "Unknown API error") as ApiError;
      error.status = response.status;
      error.data = errorData;
      error.rawErrorBody = rawErrorBody;
      console.error("[fetchWrapper] API Error (HTTP Status):", error, "URL:", url, "Options:", options, "Response Status:", response.status);
      throw error;
    }

    if (response.status === 204) {
        return {} as T;
    }
    return response.json() as Promise<T>;

  } catch (error: any) {
    console.error("[fetchWrapper] Caught Error in outer try-catch:", error, "URL:", url, "Options:", options);
    if (error.name === 'AbortError') {
        throw new Error('Request aborted');
    }
    if (error.status && error.data) {
        throw error;
    }
    const networkError: ApiError = new Error(error.message || 'A network error occurred, or the server is unreachable.') as ApiError;
    networkError.data = { message: networkError.message };
    if (response) {
        networkError.status = response.status;
    } else {
        networkError.status = 0;
    }
    throw networkError;
  }
}

const SHOP_BASE_URL = `${API_ROOT}/shop`;

export interface GetProductsParams {
  category__slug?: string;
  tags?: string;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  min_price?: number;
  max_price?: number;
  brand__slug?: string;
  color?: string;
  size?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const getProducts = (params?: GetProductsParams): Promise<PaginatedProducts> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  return fetchWrapper<PaginatedProducts>(`${SHOP_BASE_URL}/products/?${queryParams.toString()}`);
};

export const getProductBySlug = (slug: string): Promise<Product> => {
  return fetchWrapper<Product>(`${SHOP_BASE_URL}/products/${slug}/`);
};

export const getCategories = (): Promise<ProductCategoryType[]> => {
    return fetchWrapper<PaginatedResponse<ProductCategoryType>>(`${SHOP_BASE_URL}/categories/?limit=100`)
        .then(data => data.results || (data as any as ProductCategoryType[]));
};

export const getCategoryBySlug = (slug: string): Promise<ProductCategoryType> => {
  return fetchWrapper<ProductCategoryType>(`${SHOP_BASE_URL}/categories/${slug}/`);
};

export const getProductReviews = (productIdOrSlug: string | number): Promise<Review[]> => {
  return fetchWrapper<PaginatedResponse<Review>>(`${SHOP_BASE_URL}/products/${productIdOrSlug}/reviews/`)
    .then(data => data.results || (data as any as Review[]));
};

export const createProductReview = (productIdOrSlug: string | number, reviewData: Omit<Review, 'id' | 'created_at' | 'product' | 'user'>): Promise<Review> => {
  return fetchWrapper<Review>(`${SHOP_BASE_URL}/products/${productIdOrSlug}/reviews/`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

const ACCOUNTS_BASE_URL = `${API_ROOT}/accounts`;

export const registerUser = (userData: RegisterData): Promise<User> => {
  return fetchWrapper<User>(`${ACCOUNTS_BASE_URL}/register/`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = (credentials: LoginCredentials): Promise<AuthTokens> => {
  if (!credentials.username || !credentials.password) {
    const missingFields = [];
    if (!credentials.username) missingFields.push("Username (email)");
    if (!credentials.password) missingFields.push("Password");
    return Promise.reject({ message: `${missingFields.join(" and ")} is required for login.` });
  }
  return fetchWrapper<AuthTokens>(`${ACCOUNTS_BASE_URL}/token/`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const refreshToken = (refreshTok: string): Promise<{ access: string }> => {
  return fetchWrapper<{ access: string }>(`${ACCOUNTS_BASE_URL}/token/refresh/`, {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshTok }),
  });
};

export const getUserDetails = (): Promise<User> => {
  return fetchWrapper<User>(`${ACCOUNTS_BASE_URL}/user/`);
};

export const updateUserDetails = (userData: Partial<Omit<User, 'id' | 'email' | 'username'>>): Promise<User> => {
  return fetchWrapper<User>(`${ACCOUNTS_BASE_URL}/user/`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};

export const getUserAddresses = (): Promise<Address[]> => {
  return fetchWrapper<PaginatedResponse<Address>>(`${ACCOUNTS_BASE_URL}/addresses/`)
     .then(data => data.results || (data as any as Address[]));
};

export const addAddress = (addressData: Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'>): Promise<Address> => {
  return fetchWrapper<Address>(`${ACCOUNTS_BASE_URL}/addresses/`, {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
};

export const updateAddress = (addressId: number, addressData: Partial<Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'>>): Promise<Address> => {
  return fetchWrapper<Address>(`${ACCOUNTS_BASE_URL}/addresses/${addressId}/`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
};

export const deleteAddress = (addressId: number): Promise<void> => {
  return fetchWrapper<void>(`${ACCOUNTS_BASE_URL}/addresses/${addressId}/`, {
    method: 'DELETE',
  });
};

const ORDERS_BASE_URL = `${API_ROOT}/orders`;

export const createOrder = (orderData: CreateOrderPayload): Promise<Order> => {
  return fetchWrapper<Order>(`${ORDERS_BASE_URL}/`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getUserOrders = (): Promise<Order[]> => {
  return fetchWrapper<PaginatedResponse<Order>>(`${ORDERS_BASE_URL}/`)
    .then(data => data.results || (data as any as Order[]));
};

export const getOrderDetails = (orderId: number): Promise<Order> => {
  return fetchWrapper<Order>(`${ORDERS_BASE_URL}/${orderId}/`);
};

const WISHLIST_BASE_URL = `${API_ROOT}/wishlists`;

export const getWishlist = (): Promise<ApiWishlistItem[]> => { // Changed return type to ApiWishlistItem[]
    return fetchWrapper<{items: ApiWishlistItem[]}>(`${WISHLIST_BASE_URL}/`).then(data => data.items || []);
};

export const addToWishlist = (productId: number): Promise<ApiWishlistItem> => { // Changed return type
    return fetchWrapper<ApiWishlistItem>(`${WISHLIST_BASE_URL}/add-item/`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
    });
};

export const removeFromWishlist = (productId: number): Promise<void> => {
    return fetchWrapper<void>(`${WISHLIST_BASE_URL}/remove-item/${productId}/`, {
        method: 'DELETE',
    });
};

export const clearWishlist = (): Promise<void> => {
    return fetchWrapper<void>(`${WISHLIST_BASE_URL}/clear/`, {
        method: 'POST',
    });
};
