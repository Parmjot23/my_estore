// src/lib/apiService.ts
import { Product, PaginatedProducts, Review, Tag, Order, CreateOrderPayload, WishlistItem as ApiWishlistItem, ApiCartItem, Category as ProductCategoryType } from "@/types/product";
import { Category } from "@/types/category"; // Corrected: Removed 's'
import { User, AuthTokens, LoginCredentials, RegisterData, Address, ChangePasswordData } from "@/types/user";

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
    // console.log("[getAuthToken] Retrieved token from localStorage:", token);
    if (token === "undefined" || token === "null") {
        // console.warn("[getAuthToken] localStorage contains invalid token string:", token);
        return null;
    }
    return token;
  }
  return null;
};

async function fetchWrapper<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // console.log(`[fetchWrapper] Requesting: ${options?.method || 'GET'} ${url}`);
  // if (options?.body) {
  //     console.log(`[fetchWrapper] Request Body: ${options.body}`);
  // }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // console.log("[fetchWrapper] Using token for Authorization header:", token);
  } else {
    // console.log("[fetchWrapper] No token found or token is invalid, 'Authorization' header not set.");
  }
  // console.log("[fetchWrapper] Request Headers:", headers);


  let response;
  try {
    response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorData: ApiErrorData = { message: `API request failed with status ${response.status}: ${response.statusText}` };
      let rawErrorBody = '';
      try {
        rawErrorBody = await response.text();
        // console.log(`[fetchWrapper] Raw Error Response Body (Status ${response.status}):`, rawErrorBody);
        const jsonError = JSON.parse(rawErrorBody);
        errorData = { ...errorData, ...jsonError };
      } catch (e) {
        errorData.message = `API request failed with status ${response.status}. Non-JSON response: ${rawErrorBody.substring(0,100)}...`;
        // console.warn(`[fetchWrapper] Could not parse error response as JSON. Status: ${response.status}, Body: ${rawErrorBody}`);
      }

      const error: ApiError = new Error(errorData.detail || errorData.message || "Unknown API error") as ApiError;
      error.status = response.status;
      error.data = errorData;
      error.rawErrorBody = rawErrorBody;
      console.error("[fetchWrapper] API Error (HTTP Status):", error, "URL:", url, "Options:", options, "Response Status:", response.status);
      throw error;
    }

    if (response.status === 204) { // Handle No Content response
        return {} as T; // Or resolve(undefined) or resolve(null) depending on expected behavior
    }
    return response.json() as Promise<T>;

  } catch (error: any) {
    console.error("[fetchWrapper] Caught Error in outer try-catch:", error, "URL:", url, "Options:", options);
    if (error.name === 'AbortError') {
        throw new Error('Request aborted');
    }
    // If it's already our custom ApiError, rethrow it
    if (error.status && error.data) {
        throw error;
    }
    // Otherwise, wrap it
    const networkError: ApiError = new Error(error.message || 'A network error occurred, or the server is unreachable.') as ApiError;
    networkError.data = { message: networkError.message }; // Ensure data object exists
    if (response) { // if response is defined, it means fetch itself didn't fail
        networkError.status = response.status;
    } else { // Likely a network error where response is undefined
        networkError.status = 0; // Indicate a network or unreachable server error
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
        if (key === 'min_price') {
          queryParams.append('price__gte', String(value));
        } else if (key === 'max_price') {
          queryParams.append('price__lte', String(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  return fetchWrapper<PaginatedProducts>(`${SHOP_BASE_URL}/products/?${queryParams.toString()}`);
};

export const getProductBySlug = (slug: string): Promise<Product> => {
  return fetchWrapper<Product>(`${SHOP_BASE_URL}/products/${slug}/`);
};

export const getCategories = (): Promise<ProductCategoryType[]> => {
    // Assuming the direct response is PaginatedResponse<ProductCategoryType>
    // If it can sometimes be just ProductCategoryType[], the original logic was fine,
    // but it's safer to expect a consistent paginated structure or handle both explicitly.
    return fetchWrapper<PaginatedResponse<ProductCategoryType>>(`${SHOP_BASE_URL}/categories/?limit=100`) // Fetch more categories
        .then(data => data.results || []); // Always expect results from a paginated response
};

export const getCategoryBySlug = (slug: string): Promise<ProductCategoryType> => {
  return fetchWrapper<ProductCategoryType>(`${SHOP_BASE_URL}/categories/${slug}/`);
};

// Assuming product_pk is used in the URL structure as defined in backend's reviews/views.py
export const getProductReviews = (productIdOrSlug: string | number): Promise<Review[]> => {
  // The backend ProductReviewViewSet get_queryset uses self.kwargs.get('product_pk')
  // This means the URL in the backend is nested, e.g., /products/{product_pk}/reviews/
  // Ensure the DRF-Nested-Routers setup generates this URL for this viewset.
  // If not using drf-nested-routers and you have a simpler, non-nested route like /reviews/?product=<id_or_slug>, adjust here.
  // For now, assuming the nested structure is intended for full CRUD via ProductReviewViewSet.
  // If ProductReviewViewSet is registered at /api/reviews/ and filters by product_pk query param:
  // return fetchWrapper<PaginatedResponse<Review>>(`${API_ROOT}/reviews/?product=${productIdOrSlug}`)
  // But current backend reviews/urls.py is empty and views.py refers to product_pk from kwargs,
  // implying it expects to be nested under a product route.
  // Let's assume the main urls.py nests it: path('api/shop/products/<slug:product_pk>/reviews/', include('reviews.urls')) - but reviews.urls is empty
  // The most straightforward setup without drf-nested-routers in this case would be:
  // 1. Create a simple list view in reviews/views.py that filters by product ID/slug from query param.
  // 2. Register that view in reviews/urls.py.
  // 3. Include reviews.urls in the main project urls.py at a path like 'api/reviews/'.
  // Given current setup:
  // It seems reviews might be intended to be fetched via a custom action on ProductViewSet or ProductReviewViewSet used as nested.
  // For now, will assume a direct endpoint like the one below which is common. If it's nested, this needs adjustment.
  // Let's adjust assuming the backend /reviews/ endpoint will filter by product ID.
  return fetchWrapper<PaginatedResponse<Review>>(`${API_ROOT}/reviews/?product=${productIdOrSlug}`)
    .then(data => data.results || []);
};

export const createProductReview = (productId: number, reviewData: Omit<Review, 'id' | 'created_at' | 'product' | 'user'>): Promise<Review> => {
  // The ProductReviewViewSet's perform_create uses product_id=product_id
  // It also expects 'product_pk' from kwargs for get_queryset.
  // This implies it's meant to be called on a nested URL like /products/{product_pk}/reviews/
  // If review creation doesn't require product_pk in URL but product ID in payload:
  // return fetchWrapper<Review>(`${API_ROOT}/reviews/`, {
  //   method: 'POST',
  //   body: JSON.stringify({...reviewData, product: productId }), // Add product ID to payload
  // });
  // Given the view's perform_create: serializer.save(product_id=product_id, ...)
  // and get_queryset: product_id = self.kwargs.get('product_pk'), it expects a nested URL.
  // This would mean the actual call might be more complex if not using a helper that builds nested URLs.
  // For simplicity, assuming the API endpoint for creating a review might look like this and expects product in the body:
  // OR, if the ProductReviewViewSet is correctly nested under products in Django's URL config
  // and productIdOrSlug refers to the product's slug or pk for that nested route:
  return fetchWrapper<Review>(`${SHOP_BASE_URL}/products/${productId}/reviews/`, { // Assuming nested URL
    method: 'POST',
    body: JSON.stringify(reviewData), // product_id will be taken from URL kwarg on backend
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
    // Return a rejected promise with an ApiError-like structure
    return Promise.reject({
        message: `${missingFields.join(" and ")} is required for login.`,
        status: 400, // Bad Request
        data: { message: `${missingFields.join(" and ")} is required for login.` }
    });
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
  return fetchWrapper<User>(`${ACCOUNTS_BASE_URL}/user/`, { // Changed to PATCH for partial updates
    method: 'PATCH', // Use PATCH for partial updates
    body: JSON.stringify(userData),
  });
};

// Placeholder for password change - requires a dedicated backend endpoint
export const changePassword = (passwordData: ChangePasswordData): Promise<any> => {
    // This would point to an endpoint like /api/accounts/change-password/
    // For now, it's a placeholder.
    console.warn("changePassword API call is not implemented yet. Backend endpoint needed.");
    return fetchWrapper<any>(`${ACCOUNTS_BASE_URL}/password/change/`, { // Example endpoint
        method: 'POST',
        body: JSON.stringify(passwordData),
    });
};

export const requestPasswordReset = (email: string): Promise<void> => {
  return fetchWrapper<void>(`${ACCOUNTS_BASE_URL}/password-reset/`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};


export const getUserAddresses = (): Promise<Address[]> => {
  return fetchWrapper<PaginatedResponse<Address>>(`${ACCOUNTS_BASE_URL}/addresses/`)
     .then(data => data.results || (data as any as Address[])); // Handle if API directly returns array
};

export const addAddress = (addressData: Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'>): Promise<Address> => {
  return fetchWrapper<Address>(`${ACCOUNTS_BASE_URL}/addresses/`, {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
};

export const updateAddress = (addressId: number, addressData: Partial<Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'>>): Promise<Address> => {
  // DRF ModelViewSet typically uses PUT for full update, PATCH for partial.
  // Let's assume PATCH is preferred for flexibility if not all fields are sent.
  return fetchWrapper<Address>(`${ACCOUNTS_BASE_URL}/addresses/${addressId}/`, {
    method: 'PATCH', // Changed to PATCH
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
  return fetchWrapper<PaginatedResponse<Order>>(`${ORDERS_BASE_URL}/`) // Assuming it's paginated
    .then(data => data.results || (data as any as Order[])); // Handle if API directly returns array
};

export const getOrderDetails = (orderId: number): Promise<Order> => {
  return fetchWrapper<Order>(`${ORDERS_BASE_URL}/${orderId}/`);
};


const WISHLIST_BASE_URL = `${API_ROOT}/wishlists`;

// Fetches the user's wishlist, which contains items. Each item has product_details.
export const getWishlist = (): Promise<ApiWishlistItem[]> => {
    // The endpoint `/api/wishlists/` (WishlistViewSet's list action)
    // returns a single Wishlist object for the user, which contains 'items'.
    return fetchWrapper<{id: number; user: number; items: ApiWishlistItem[]; created_at: string; updated_at: string}>(`${WISHLIST_BASE_URL}/`)
        .then(data => data.items || []); // Extract the 'items' array
};

export const addToWishlist = (productId: number): Promise<ApiWishlistItem> => {
    return fetchWrapper<ApiWishlistItem>(`${WISHLIST_BASE_URL}/add-item/`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
    });
};

export const removeFromWishlist = (productId: number): Promise<void> => {
    // The URL for remove-item includes the product_pk, which is the product ID.
    return fetchWrapper<void>(`${WISHLIST_BASE_URL}/remove-item/${productId}/`, {
        method: 'DELETE',
    });
};

export const clearWishlist = (): Promise<void> => {
    // WishlistViewSet's clear_wishlist action is at /clear
    return fetchWrapper<void>(`${WISHLIST_BASE_URL}/clear/`, {
        method: 'DELETE', // Usually a POST or DELETE for actions that modify state. Backend uses DELETE.
    });
};

const CART_BASE_URL = `${API_ROOT}/carts`;

export const getCart = (): Promise<ApiCartItem[]> => {
    return fetchWrapper<{id: number; user: number; items: ApiCartItem[]}>(`${CART_BASE_URL}/`)
        .then(data => data.items || []);
};

export const addToCart = (productId: number, quantity: number = 1): Promise<ApiCartItem> => {
    return fetchWrapper<ApiCartItem>(`${CART_BASE_URL}/add-item/`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
    });
};

export const updateCartItem = (productId: number, quantity: number): Promise<ApiCartItem> => {
    return fetchWrapper<ApiCartItem>(`${CART_BASE_URL}/update-item/${productId}/`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    });
};

export const removeFromCart = (productId: number): Promise<void> => {
    return fetchWrapper<void>(`${CART_BASE_URL}/remove-item/${productId}/`, {
        method: 'DELETE',
    });
};

export const clearCart = (): Promise<void> => {
    return fetchWrapper<void>(`${CART_BASE_URL}/clear/`, {
        method: 'DELETE',
    });
};
