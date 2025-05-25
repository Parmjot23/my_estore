import { Product } from './product';

export type PromoBanner = {
  id: number;
  product: number;
  product_details?: Product;
  size: 'large' | 'small';
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};
