// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'skincare' | 'haircare' | 'lipcare' | 'combo';
  description: string;
  benefits: string[];
  usage: string;
  original_price: number;
  offer_price: number;
  image_url: string;
  images?: string[];  // Array of additional product images for gallery
  is_combo: boolean;
  in_stock: boolean;
  created_at: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order Types
export interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  items: CartItem[];
  subtotal: number;
  shipping_charge: number;
  total: number;
  payment_method: 'online' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed';
  courier_service: 'dtdc' | 'postal';
  order_status: 'not_yet_shipped' | 'shipped' | 'delivered';
  cashfree_order_id?: string;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Shipping charges
export const SHIPPING_CHARGES = {
  online: {
    dtdc: 60,
    postal: 0,
  },
  cod: 100, // Fixed charge for COD
} as const;