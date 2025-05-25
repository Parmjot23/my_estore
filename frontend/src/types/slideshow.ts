import { Product } from './product';

export type SlideshowItem = {
  id: number;
  product: number;
  product_details?: Product;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};
