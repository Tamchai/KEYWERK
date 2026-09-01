export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  product_id: string;
  category_id: string;
  brand_id: string;
  product_name: string;
  description: string;
  total_sold: number;
}

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  image_id: string;
  image_url?: string;
  variant_name: string;
  stock: number;
  price: number;
  sold_count: number;
  attributes?: Record<string, unknown>;
}

export interface LoginResponse {
  message: string;
  email: string;
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface CartItem {
  cartitem_id: string;
  variant_id: string;
  variant_name: string;
  product_id: string;
  product_name: string;
  image_url: string;
  price: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface Cart {
  cart_id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface DisplayProduct {
  id: string;
  image: string;
  category: string;
  brand?: string;
  name: string;
  price: string;
  href: string;
}
