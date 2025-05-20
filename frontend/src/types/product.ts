// src/types/product.ts

// New type for individual media items (image or video)
export type ProductMediaItem = {
  id: number;
  media_type: 'IMG' | 'VID'; // 'IMG' for Image, 'VID' for Video
  file_url: string;          // URL to the actual image or video file
  alt_text?: string;         // Alt text for images
  is_thumbnail?: boolean;
  is_preview?: boolean;
  video_thumbnail_url?: string; // URL for video thumbnail image
  order?: number;
};

// Existing Product type, updated
export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category?: number; // Category ID
  category_details?: {
    id: number;
    name: string;
    slug: string;
  };
  brand?: number; // Brand ID
  brand_details?: {
    id: number;
    name: string;
    slug: string;
  };
  price: number; // Ensure this is a number
  discounted_price?: number; // Ensure this is a number or null/undefined
  get_discount_percentage?: number;
  sku?: string;
  stock_quantity?: number;
  is_available?: boolean;

  compatible_phone_models?: {
    id: number;
    name: string;
    slug: string;
    brand_name?: string;
  }[];

  color?: string;
  material?: string;
  connectivity_type?: string;
  wattage?: string;
  size?: string; // Added for consistency if used as a direct product attribute

  cover_image_url?: string;
  product_media?: ProductMediaItem[];

  imgs?: {
    thumbnails: string[];
    previews: string[];
  };

  reviews: number; // Was reviews_count in Django model, ensure it's a number
  average_rating?: number; // Ensure this is a number or null/undefined

  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  is_featured?: boolean;

  created_at?: string;
  updated_at?: string;

  // For variants if you implement them
  variants?: ProductVariant[];
};

// Type for Product Variants (Optional, if you have product variants)
export type ProductVariant = {
  id: number;
  sku: string;
  stock_quantity: number;
  price_override?: number; // If variant has a different price
  attributes: Array<{ attribute: string; value: string }>; // e.g., [{attribute: "Color", value: "Red"}, {attribute: "Size", value: "M"}]
  // Add other variant-specific fields like image if needed
};


// Type for items as returned by the Wishlist API (matching WishlistItemSerializer)
export type ApiWishlistItem = {
  id: number; // This is the ID of the WishlistItem itself
  product_id: number; // ID of the product
  product_details: Product; // The nested Product object
  added_at: string;
};


export type CategoryChild = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  product_count?: number;
}

export type Category = {
  id: number;
  name:string;
  slug: string;
  description?: string;
  image_url?: string;
  parent?: number;
  parent_slug?: string;
  children?: CategoryChild[];
  created_at?: string;
  updated_at?: string;
  product_count?: number; // Added from CategorySerializer
};

// Other existing types (Tag, Review, Order, CreateOrderPayload) would go here if they are in this file.
// For brevity, assuming they are correctly defined elsewhere or not directly relevant to this specific fix.

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Review = {
  id: number;
  product: number; // Product ID
  user?: number; // User ID, optional if anonymous reviews are allowed
  user_name: string; // Name of the reviewer
  rating: number;
  comment: string;
  created_at: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_details?: Product; // Optional: for richer display
  price: number; // Price at the time of purchase
  quantity: number;
  get_cost?: number; // Calculated field
};

export type Order = {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  street_address: string;
  apartment_address?: string;
  postal_code: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
  is_paid: boolean;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  braintree_id?: string;
  items: OrderItem[];
  total_cost?: number; // Calculated field
};

export type CreateOrderPayload = Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'total_cost' | 'items'> & {
  items: Array<Pick<OrderItem, 'product_id' | 'quantity' | 'price'>>;
  // Add any other payment-related fields if needed, e.g., braintree_nonce
};

// This was previously in wishlist-slice.ts, ensure it aligns with Product type
export type WishlistItem = Product; // Wishlist items in Redux store are Product objects
