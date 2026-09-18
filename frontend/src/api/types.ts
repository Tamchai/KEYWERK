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
  images: string[];
  category: string;
  brand?: string;
  name: string;
  price: string;
  href: string;
}

export interface DataResponse<T> { message: string; data: T }

export interface Address {
  address_id: string; user_id: string; title: string; receiver_name: string;
  phone_number: string; address_line1: string; address_line2: string;
  district: string; province: string; postal_code: string; is_default: boolean;
  created_at: string;
}

export type AddressPayload = Omit<Address, "address_id" | "user_id" | "created_at">;
export type OrderStatus = "pending" | "processing" | "shipped" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "stripe";

export interface OrderItem {
  orderitem_id: string; variant_id: string; variant_name: string; product_id: string;
  product_name: string; image_url: string; unit_price: number; quantity: number; subtotal: number;
}

export interface Order {
  order_id: string; user_id: string; status: OrderStatus; total_price: number;
  shipping_method: string; tracking_number: string; receiver_name: string;
  phone_number: string; address_line1: string; address_line2: string;
  district: string; province: string; postal_code: string; created_at: string; updated_at: string;
}

export interface Payment {
  payment_id: string; order_id: string; amount: number; status: PaymentStatus;
  payment_method: PaymentMethod; paid_at?: string; provider_session_id?: string;
  provider_payment_intent_id?: string; checkout_url?: string;
}

export interface OrderDetail extends Order { items: OrderItem[]; payment?: Payment }

export interface CreateOrderPayload {
  address_id?: string; receiver_name?: string; phone_number?: string; address_line1?: string;
  address_line2?: string; district?: string; province?: string; postal_code?: string;
  shipping_method?: string; items?: Array<{ variant_id: string; quantity: number }>;
}
